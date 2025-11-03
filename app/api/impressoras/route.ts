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
        .limit(limit),
      Impressora.countDocuments({}),
    ]);

    console.log('Impressoras encontradas (raw):', impressorasRaw.length);

    // Serialize impressoras to plain objects
    const impressoras = impressorasRaw.map(impressora => {
      try {
      const impressoraObj: any = {
        _id: impressora._id.toString(),
        setor: impressora.setor,
        numeroSerie: impressora.numeroSerie,
        enderecoIP: impressora.enderecoIP,
        categoria: impressora.categoria || null,
        createdAt: impressora.createdAt?.toISOString() || new Date().toISOString(),
        updatedAt: impressora.updatedAt?.toISOString() || new Date().toISOString(),
      };

      // Serialize tipo
      if (impressora.tipo) {
        if (typeof impressora.tipo === 'object' && '_id' in impressora.tipo && 'nome' in impressora.tipo) {
          impressoraObj.tipo = {
            _id: impressora.tipo._id.toString(),
            nome: impressora.tipo.nome
          };
        } else {
          impressoraObj.tipo = {
            _id: impressora.tipo.toString(),
            nome: 'N/A'
          };
        }
      } else {
        impressoraObj.tipo = null;
      }

      // Serialize modelo (with marca nested)
      if (impressora.modelo) {
        if (typeof impressora.modelo === 'object' && '_id' in impressora.modelo) {
          const modelo = impressora.modelo as any;
          impressoraObj.modelo = {
            _id: modelo._id.toString(),
            nome: modelo.nome || 'N/A',
            marca: modelo.marca ? {
              _id: typeof modelo.marca === 'object' && '_id' in modelo.marca 
                ? modelo.marca._id.toString() 
                : modelo.marca.toString(),
              nome: typeof modelo.marca === 'object' && 'nome' in modelo.marca 
                ? modelo.marca.nome 
                : 'N/A'
            } : null
          };
        } else {
          impressoraObj.modelo = {
            _id: impressora.modelo.toString(),
            nome: 'N/A',
            marca: null
          };
        }
      } else {
        impressoraObj.modelo = null;
      }

      // Serialize faixa
      if (impressora.faixa) {
        if (typeof impressora.faixa === 'object' && '_id' in impressora.faixa) {
          const faixa = impressora.faixa as any;
          impressoraObj.faixa = {
            _id: faixa._id.toString(),
            tipo: faixa.tipo || null,
            nome: faixa.nome || 'N/A',
            faixa: faixa.faixa || null,
            vlanNome: faixa.vlanNome || null,
            vlanId: faixa.vlanId || null,
          };
        } else {
          impressoraObj.faixa = {
            _id: impressora.faixa.toString(),
            tipo: null,
            nome: 'N/A',
            faixa: null,
            vlanNome: null,
            vlanId: null,
          };
        }
      } else {
        impressoraObj.faixa = null;
      }

        return impressoraObj;
      } catch (err: any) {
        console.error('Erro ao serializar impressora:', err, impressora._id);
        // Retorna pelo menos os dados básicos
        return {
          _id: impressora._id.toString(),
          setor: impressora.setor || 'N/A',
          numeroSerie: impressora.numeroSerie || 'N/A',
          enderecoIP: impressora.enderecoIP || 'N/A',
          categoria: impressora.categoria || null,
          tipo: null,
          modelo: null,
          faixa: null,
          createdAt: impressora.createdAt?.toISOString() || new Date().toISOString(),
          updatedAt: impressora.updatedAt?.toISOString() || new Date().toISOString(),
        };
      }
    }).filter(Boolean); // Remove qualquer null/undefined

    console.log('Impressoras serializadas:', impressoras.length);
    if (impressoras.length > 0) {
      console.log('Primeira impressora serializada:', JSON.stringify(impressoras[0], null, 2));
    }

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

