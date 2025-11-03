import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Modelo from '@/lib/models/Modelo';
import { verifyToken } from '@/lib/auth';

async function checkAuth(request: NextRequest) {
  const token = request.cookies.get('token')?.value;

  if (!token) {
    return null;
  }

  const payload = await verifyToken(token);
  return payload;
}

export async function GET(request: NextRequest) {
  try {
    const auth = await checkAuth(request);
    
    if (!auth) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    const modelosRaw = await Modelo.find({})
      .populate({ path: 'marca', strictPopulate: false })
      .sort({ nome: 1 });

    console.log('Modelos encontrados (raw):', modelosRaw.length);
    if (modelosRaw.length > 0) {
      console.log('Primeiro modelo raw:', modelosRaw[0]);
    }
    
    // Convert to plain objects to ensure proper serialization
    const modelos = modelosRaw.map(modelo => {
      try {
      const marcaObj = modelo.marca;
      let marcaSerializada = null;
      
      if (marcaObj) {
        if (typeof marcaObj === 'object' && '_id' in marcaObj && 'nome' in marcaObj) {
          // Marca foi populada corretamente
          marcaSerializada = {
            _id: marcaObj._id.toString(),
            nome: marcaObj.nome
          };
        } else {
          // Marca não foi populada, apenas retorna o ObjectId
          marcaSerializada = {
            _id: marcaObj.toString(),
            nome: 'N/A'
          };
        }
      }

        return {
          _id: modelo._id.toString(),
          nome: modelo.nome || 'N/A',
          marca: marcaSerializada,
          createdAt: modelo.createdAt?.toISOString() || new Date().toISOString(),
          updatedAt: modelo.updatedAt?.toISOString() || new Date().toISOString(),
        };
      } catch (err: any) {
        console.error('Erro ao serializar modelo:', err, modelo._id);
        // Retorna pelo menos os dados básicos
        return {
          _id: modelo._id.toString(),
          nome: modelo.nome || 'N/A',
          marca: null,
          createdAt: modelo.createdAt?.toISOString() || new Date().toISOString(),
          updatedAt: modelo.updatedAt?.toISOString() || new Date().toISOString(),
        };
      }
    }).filter(Boolean); // Remove qualquer null/undefined

    console.log('Modelos serializados:', modelos.length);
    if (modelos.length > 0) {
      console.log('Primeiro modelo serializado:', JSON.stringify(modelos[0], null, 2));
    }
    
    return NextResponse.json({ modelos: modelos || [] });
  } catch (error: any) {
    console.error('Error fetching modelos:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error', modelos: [] },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await checkAuth(request);
    
    if (!auth) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    const { nome, marca } = await request.json();

    console.log('Criando modelo:', { nome, marca });

    if (!nome || !marca) {
      return NextResponse.json(
        { error: 'Nome e Marca são obrigatórios' },
        { status: 400 }
      );
    }

    // Verificar se já existe um modelo com o mesmo nome e marca
    const existingModelo = await Modelo.findOne({ 
      nome: nome.trim(), 
      marca: marca 
    });

    console.log('Modelo existente encontrado:', existingModelo);

    if (existingModelo) {
      return NextResponse.json(
        { error: 'Este modelo já existe para esta marca' },
        { status: 400 }
      );
    }

    const modelo = await Modelo.create({ 
      nome: nome.trim(), 
      marca 
    });

    const populatedModelo = await Modelo.findById(modelo._id).populate('marca');

    // Serializar o modelo populado
    const modeloSerializado = {
      _id: populatedModelo!._id.toString(),
      nome: populatedModelo!.nome,
      marca: populatedModelo!.marca ? {
        _id: typeof populatedModelo!.marca === 'object' && '_id' in populatedModelo!.marca 
          ? populatedModelo!.marca._id.toString() 
          : populatedModelo!.marca.toString(),
        nome: typeof populatedModelo!.marca === 'object' && 'nome' in populatedModelo!.marca 
          ? populatedModelo!.marca.nome 
          : 'N/A'
      } : null,
      createdAt: populatedModelo!.createdAt?.toISOString() || new Date().toISOString(),
      updatedAt: populatedModelo!.updatedAt?.toISOString() || new Date().toISOString(),
    };

    return NextResponse.json(
      { modelo: modeloSerializado },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating modelo:', error);
    
    if (error.code === 11000) {
      console.error('Duplicate key error:', error.keyPattern);
      return NextResponse.json(
        { error: 'Este modelo já existe para esta marca' },
        { status: 400 }
      );
    }

    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map((err: any) => err.message);
      return NextResponse.json(
        { error: errors.join(', ') },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

