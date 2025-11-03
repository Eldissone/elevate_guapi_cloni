import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Impressora from '@/lib/models/Impressora';
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

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = 10;
    const skip = (page - 1) * limit;

    const [impressorasRaw, total] = await Promise.all([
      Impressora.find({})
        .populate({ path: 'faixa', strictPopulate: false })
        .populate({ path: 'modelo', populate: { path: 'marca', strictPopulate: false }, strictPopulate: false })
        .populate({ path: 'tipo', strictPopulate: false })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Impressora.countDocuments({}),
    ]);

    console.log('Impressoras encontradas:', impressorasRaw.length);

    // Serialize impressoras to plain objects
    const impressoras = impressorasRaw.map((impressora: any) => {
      const obj: any = {
        _id: impressora._id.toString(),
        setor: impressora.setor || '',
        numeroSerie: impressora.numeroSerie || '',
        enderecoIP: impressora.enderecoIP || '',
        categoria: impressora.categoria || null,
        createdAt: impressora.createdAt?.toString() || new Date().toISOString(),
        updatedAt: impressora.updatedAt?.toString() || new Date().toISOString(),
      };

      // Serialize tipo
      if (impressora.tipo && impressora.tipo._id) {
        obj.tipo = {
          _id: impressora.tipo._id.toString(),
          nome: impressora.tipo.nome || 'N/A'
        };
      } else {
        obj.tipo = null;
      }

      // Serialize modelo
      if (impressora.modelo && impressora.modelo._id) {
        obj.modelo = {
          _id: impressora.modelo._id.toString(),
          nome: impressora.modelo.nome || 'N/A',
          marca: impressora.modelo.marca && impressora.modelo.marca._id ? {
            _id: impressora.modelo.marca._id.toString(),
            nome: impressora.modelo.marca.nome || 'N/A'
          } : null
        };
      } else {
        obj.modelo = null;
      }

      // Serialize faixa
      if (impressora.faixa && impressora.faixa._id) {
        obj.faixa = {
          _id: impressora.faixa._id.toString(),
          tipo: impressora.faixa.tipo || null,
          nome: impressora.faixa.nome || 'N/A',
          faixa: impressora.faixa.faixa || null,
          vlanNome: impressora.faixa.vlanNome || null,
          vlanId: impressora.faixa.vlanId || null,
        };
      } else {
        obj.faixa = null;
      }

      return obj;
    });

    return NextResponse.json({
      impressoras: impressoras || [],
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error('Error fetching impressoras:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error', impressoras: [] },
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

    const { setor, numeroSerie, tipo, enderecoIP, categoria, faixa, modelo } = await request.json();

    if (!setor || !numeroSerie || !tipo || !enderecoIP) {
      return NextResponse.json(
        { error: 'Setor, Número de Série, Tipo e Endereço IP são obrigatórios' },
        { status: 400 }
      );
    }

    const newImpressora = await Impressora.create({
      setor,
      numeroSerie,
      tipo,
      enderecoIP,
      categoria: categoria || undefined,
      faixa: faixa || undefined,
      modelo: modelo || undefined,
    });

    const populatedImpressora = await Impressora.findById(newImpressora._id).populate('faixa').populate({ path: 'modelo', populate: { path: 'marca' } }).populate('tipo');

    return NextResponse.json(
      { impressora: populatedImpressora },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating impressora:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map((err: any) => err.message);
      return NextResponse.json(
        { error: errors.join(', ') },
        { status: 400 }
      );
    }

    if (error.code === 11000) {
      return NextResponse.json(
        { error: 'Este número de série já está cadastrado' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

