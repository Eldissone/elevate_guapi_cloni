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
      .sort({ nome: 1 })
      .lean();

    console.log('Modelos encontrados:', modelosRaw.length);
    
    // Convert to plain objects
    const modelos = modelosRaw.map((modelo: any) => {
      const obj: any = {
        _id: modelo._id.toString(),
        nome: modelo.nome || '',
        createdAt: modelo.createdAt?.toString() || new Date().toISOString(),
        updatedAt: modelo.updatedAt?.toString() || new Date().toISOString(),
      };

      // Serialize marca
      if (modelo.marca && modelo.marca._id) {
        obj.marca = {
          _id: modelo.marca._id.toString(),
          nome: modelo.marca.nome || 'N/A'
        };
      } else {
        obj.marca = null;
      }

      return obj;
    });
    
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

