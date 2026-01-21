// 1. Garante que o código execute apenas após o carregamento completo do HTML
document.addEventListener('DOMContentLoaded', () => {

    // 2. Função para buscar os leads da API
    async function fetchLeads() {
        // URL da API (Placeholder)
        const URL_API = 'https://script.google.com/macros/s/AKfycbyWIYA1HcNW4jCUdILHdHMX-bN6sbdM03RPrC6wrs5piwbqVZ0Q_5nc8c2XVLWQ3sCv2w/exec';

        try {
            // 3. Chamada GET para a API
            const response = await fetch(URL_API);
            
            // Verifica se a resposta foi bem sucedida
            if (!response.ok) throw new Error('Erro ao buscar dados da API');

            const leads = await response.json();

            // 4. Itera sobre cada objeto "lead" no array recebido
            leads.forEach(lead => {
                criarCardLead(lead);
            });

        } catch (error) {
            console.error('Erro:', error);
            // Comentário: Em caso de erro (como URL inválida), você pode mockar dados para teste:
            // renderizarExemploTeste(); 
        }
    }

    // 5. Função para criar e inserir o card no HTML
    function criarCardLead(lead) {
        // a. Cria o elemento div para o card
        const card = document.createElement('div');

        // b. Adiciona o nome do lead (e outros dados se desejar)
        card.innerHTML = `<p>${lead.nome}</p>`;

        // c. Adiciona a classe de estilo
        card.classList.add('kanban-card');

        // d. Identifica a coluna correta com base no status_funil
        // O valor de status_funil deve corresponder aos IDs das colunas (ex: 'novos-leads')
        const idColuna = `coluna-${lead.status_funil}`;
        const colunaDestino = document.getElementById(idColuna);

        // e. Anexa o card à coluna correspondente
        if (colunaDestino) {
            colunaDestino.appendChild(card);
        } else {
            console.warn(`Coluna não encontrada para o status: ${lead.status_funil}`);
        }
    }

    // 6. Chamada inicial da função
    fetchLeads();
    
    // 7. Fluxo Explicado:
    // O script aguarda o HTML carregar -> Dispara fetchLeads -> 
    // Busca dados JSON -> Para cada lead, cria um elemento visual (card) ->
    // O card é injetado na coluna que possui o ID correspondente ao status do lead.
});

/**
 * EXEMPLO DE FORMATO DE JSON ESPERADO DA API:
 * [
 *   { "nome": "Empresa ABC", "status_funil": "novos-leads" },
 *   { "nome": "João Silva", "status_funil": "negociacao" },
 *   { "nome": "Maria Souza", "status_funil": "ganhos" }
 * ]
 */
