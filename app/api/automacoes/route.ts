import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Automacao from '@/lib/models/Automacao';
import IP from '@/lib/models/IP';
import { verifyToken } from '@/lib/auth';
import mongoose from 'mongoose';

async function checkAuth(request: NextRequest) {
  const token = request.cookies.get('token')?.value;

  if (!token) {
    return null;
  }

  const payload = await verifyToken(token);
  return payload;
}

const ensureModelsRegistered = () => {
  if (!mongoose.models.IP) { require('@/lib/models/IP'); }
  if (!mongoose.models.Automacao) { require('@/lib/models/Automacao'); }
};

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
    ensureModelsRegistered();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = 10;
    const skip = (page - 1) * limit;

    const AutomacaoModel = mongoose.models.Automacao || Automacao;
    
    const [automacoesRaw, total] = await Promise.all([
      AutomacaoModel.find({})
        .populate({ path: 'faixa', model: 'IP', strictPopulate: false })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      AutomacaoModel.countDocuments({}),
    ]);

    // Serialize automacoes
    const automacoes = automacoesRaw.map((automacao: any) => ({
      _id: automacao._id.toString(),
      ip: automacao.ip || '',
      equipamento: automacao.equipamento || '',
      porta: automacao.porta || undefined,
      categoria: automacao.categoria || undefined,
      faixa: automacao.faixa ? {
        _id: automacao.faixa._id?.toString() || '',
        tipo: automacao.faixa.tipo || 'faixa',
        nome: automacao.faixa.nome || '',
        faixa: automacao.faixa.faixa || undefined,
        vlanNome: automacao.faixa.vlanNome || undefined,
        vlanId: automacao.faixa.vlanId || undefined,
      } : undefined,
      createdAt: automacao.createdAt ? new Date(automacao.createdAt).toISOString() : new Date().toISOString(),
      updatedAt: automacao.updatedAt ? new Date(automacao.updatedAt).toISOString() : new Date().toISOString(),
    }));

    return NextResponse.json({
      automacoes,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching automacoes:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
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
    ensureModelsRegistered();

    const { ip, equipamento, porta, categoria, faixa } = await request.json();

    if (!ip || !equipamento) {
      return NextResponse.json(
        { error: 'IP e Equipamento são obrigatórios' },
        { status: 400 }
      );
    }

    const AutomacaoModel = mongoose.models.Automacao || Automacao;
    
    const newAutomacao = await AutomacaoModel.create({
      ip,
      equipamento,
      porta: porta || undefined,
      categoria: categoria || undefined,
      faixa: faixa || undefined,
    });

    const automacaoPopuladaRaw = await AutomacaoModel.findById(newAutomacao._id)
      .populate({ path: 'faixa', model: 'IP', strictPopulate: false })
      .lean();

    // Serialize automacao (findById returns a single document, not an array)
    const automacaoDoc = automacaoPopuladaRaw as any;
    const automacao = automacaoDoc ? {
      _id: automacaoDoc._id.toString(),
      ip: automacaoDoc.ip || '',
      equipamento: automacaoDoc.equipamento || '',
      porta: automacaoDoc.porta || undefined,
      categoria: automacaoDoc.categoria || undefined,
      faixa: automacaoDoc.faixa ? {
        _id: automacaoDoc.faixa._id?.toString() || '',
        tipo: automacaoDoc.faixa.tipo || 'faixa',
        nome: automacaoDoc.faixa.nome || '',
        faixa: automacaoDoc.faixa.faixa || undefined,
        vlanNome: automacaoDoc.faixa.vlanNome || undefined,
        vlanId: automacaoDoc.faixa.vlanId || undefined,
      } : undefined,
      createdAt: automacaoDoc.createdAt ? new Date(automacaoDoc.createdAt).toISOString() : new Date().toISOString(),
      updatedAt: automacaoDoc.updatedAt ? new Date(automacaoDoc.updatedAt).toISOString() : new Date().toISOString(),
    } : null;

    return NextResponse.json(
      { automacao },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating automacao:', error);
    
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

