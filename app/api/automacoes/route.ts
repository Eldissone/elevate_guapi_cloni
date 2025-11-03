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

    // Serialize automacao
    const automacao = automacaoPopuladaRaw ? {
      _id: automacaoPopuladaRaw._id.toString(),
      ip: automacaoPopuladaRaw.ip || '',
      equipamento: automacaoPopuladaRaw.equipamento || '',
      porta: automacaoPopuladaRaw.porta || undefined,
      categoria: automacaoPopuladaRaw.categoria || undefined,
      faixa: automacaoPopuladaRaw.faixa ? {
        _id: automacaoPopuladaRaw.faixa._id?.toString() || '',
        tipo: automacaoPopuladaRaw.faixa.tipo || 'faixa',
        nome: automacaoPopuladaRaw.faixa.nome || '',
        faixa: automacaoPopuladaRaw.faixa.faixa || undefined,
        vlanNome: automacaoPopuladaRaw.faixa.vlanNome || undefined,
        vlanId: automacaoPopuladaRaw.faixa.vlanId || undefined,
      } : undefined,
      createdAt: automacaoPopuladaRaw.createdAt ? new Date(automacaoPopuladaRaw.createdAt).toISOString() : new Date().toISOString(),
      updatedAt: automacaoPopuladaRaw.updatedAt ? new Date(automacaoPopuladaRaw.updatedAt).toISOString() : new Date().toISOString(),
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

