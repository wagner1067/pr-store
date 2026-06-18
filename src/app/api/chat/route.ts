import { NextResponse } from 'next/server';
import { chatMessageSchema } from '@/lib/validations';
import { checkRateLimit, chatRateLimiter } from '@/lib/redis';
import { getClientIP } from '@/lib/utils';

const KNOWLEDGE_BASE: Record<string, string> = {
  frete: 'Oferecemos frete expresso local via Moto Frete para CEPs da região de fronteira começando com 85, e envios via Correios PAC/SEDEX para todo o Brasil. A retirada em mãos é gratuita em nossa loja física.',
  promissoria: 'O pagamento em promissória está disponível para compras presenciais atreladas ao seu celular, sujeito a análise cadastral no nosso ERP. Fale com um atendente na loja para mais detalhes.',
  pagamento: 'Aceitamos Pix (pagamento instantâneo com QR Code), Cartão de Crédito em até 10x sem juros, e Boleto Bancário. Para compras presenciais, também aceitamos promissória.',
  tamanho: 'Nossos tamanhos seguem o padrão brasileiro. Para tênis, recomendamos medir seu pé (em cm) e consultar a tabela de cada marca. Na dúvida, opte pelo número maior.',
  troca: 'Aceitamos trocas em até 7 dias após o recebimento, desde que o produto esteja em sua embalagem original e sem sinais de uso. Entre em contato pelo WhatsApp para iniciar o processo.',
  estoque: 'Nosso estoque é físico e sincronizado em tempo real com a loja online. Se um item aparece disponível, ele está em nosso estoque. Itens populares esgotam rápido!',
  entrega: 'Para a região de fronteira (CEP 85xxx), oferecemos entrega via Moto Frete em até 24h. Para o restante do Brasil, usamos Correios PAC (5-10 dias úteis) ou SEDEX (1-3 dias úteis).',
  desconto: 'Cadastre seu WhatsApp em nosso site para receber um cupom de 10% de boas-vindas! Também temos promoções relâmpago periódicas com descontos de até 30%.',
  tenis: 'Temos tênis premium de marcas exclusivas como Nike Jordan, Yeezy e Adidas. Navegue pela seção de Calçados para ver todos os modelos disponíveis!',
  tênis: 'Temos tênis premium de marcas exclusivas como Nike Jordan, Yeezy e Adidas. Navegue pela seção de Calçados para ver todos os modelos disponíveis!',
  roupa: 'Nossa coleção de vestuário inclui moletons Supreme, camisetas e peças exclusivas de streetwear premium. Veja toda a nossa linha na seção de Vestuário!',
  vestuario: 'Nossa coleção de vestuário inclui moletons Supreme, camisetas e peças exclusivas de streetwear premium. Veja toda a nossa linha na seção de Vestuário!',
  vestuário: 'Nossa coleção de vestuário inclui moletons Supreme, camisetas e peças exclusivas de streetwear premium. Veja toda a nossa linha na seção de Vestuário!',
  acessorio: 'Oferecemos acessórios de luxo como colares de ouro PR Store e cintos Off-White para complementar seu visual. Confira a seção de Acessórios!',
  acessório: 'Oferecemos acessórios de luxo como colares de ouro PR Store e cintos Off-White para complementar seu visual. Confira a seção de Acessórios!',
  marca: 'Trabalhamos com marcas exclusivas e selecionadas do streetwear mundial, como Nike Jordan, Supreme, Adidas, Off-White e nossa marca exclusiva PR Store.',
};

function getAIResponse(message: string): string {
  const lower = message.toLowerCase();

  if (lower.includes('olá') || lower.includes('oi') || lower.includes('bom dia') || lower.includes('boa tarde') || lower.includes('boa noite') || lower.includes('sim') || lower.includes('quero')) {
    return 'Olá! Bem-vindo à PR Store! 🛍️ Sou o assistente virtual e estou aqui para te ajudar com dúvidas sobre produtos, tamanhos, frete, pagamentos e muito mais. Como posso te ajudar hoje?';
  }

  for (const [keyword, response] of Object.entries(KNOWLEDGE_BASE)) {
    if (lower.includes(keyword)) return response;
  }

  if (lower.includes('cartao') || lower.includes('cartão') || lower.includes('credito') || lower.includes('crédito')) {
    return KNOWLEDGE_BASE.pagamento;
  }

  if (lower.includes('prazo') || lower.includes('demora') || lower.includes('chega')) {
    return KNOWLEDGE_BASE.entrega;
  }

  return 'Obrigado pela sua mensagem! Para informações mais detalhadas ou falar com um atendente humano, entre em contato pelo nosso WhatsApp: (45) 99988-7766. Nossa equipe terá prazer em ajudar! 😊';
}

export async function POST(request: Request) {
  try {
    // Rate limit
    const ip = getClientIP(request);
    const rl = await checkRateLimit(chatRateLimiter, `chat:${ip}`);
    if (!rl.success) {
      return NextResponse.json({ success: false, error: 'Muitas mensagens. Aguarde um momento.' }, { status: 429 });
    }

    const body = await request.json();
    const parsed = chatMessageSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ success: false, error: 'Mensagem inválida' }, { status: 400 });
    }

    const { message } = parsed.data;

    // Check if OpenAI Key is present in environment
    const apiKey = process.env.OPENAI_API_KEY;
    if (apiKey) {
      try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
              {
                role: 'system',
                content: `Você é o assistente inteligente da PR Store, e-commerce e loja física premium de streetwear (tênis de luxo, roupas e acessórios streetwear).
                Use esta base de conhecimento para orientar suas respostas se for relevante, mas responda de forma natural, humana e prestativa:
                - Frete/Entrega: ${KNOWLEDGE_BASE.frete}
                - Crediário/Promissória: ${KNOWLEDGE_BASE.promissoria}
                - Pagamentos: ${KNOWLEDGE_BASE.pagamento}
                - Tamanhos: ${KNOWLEDGE_BASE.tamanho}
                - Trocas: ${KNOWLEDGE_BASE.troca}
                - Estoque: ${KNOWLEDGE_BASE.estoque}
                - Contato WhatsApp: (45) 99988-7766`
              },
              { role: 'user', content: message }
            ],
            temperature: 0.7,
            max_tokens: 300,
          }),
        });

        if (response.ok) {
          const resData = await response.json();
          const reply = resData.choices?.[0]?.message?.content?.trim();
          if (reply) {
            return NextResponse.json({ success: true, reply });
          }
        }
      } catch (err) {
        console.error('OpenAI query failed, falling back to local matches:', err);
      }
    }

    // Fallback response using local keyword matching
    const reply = getAIResponse(message);
    return NextResponse.json({ success: true, reply });
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json({ success: false, error: 'Erro interno' }, { status: 500 });
  }
}
