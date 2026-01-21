document.addEventListener('DOMContentLoaded', () => {

    const URL_API = 'https://script.google.com/macros/s/AKfycbxR-86oaqFwclsQUlOM-WZ_AScREHJfaZETw-UlGWdyG5Ni3rNLGjRhsB2XM0pq4QWqcg/exec';

    async function fetchLeads() {
        try {
            const response = await fetch(URL_API);
            if (!response.ok) throw new Error('Erro ao buscar dados');
            
            const leads = await response.json();

            leads.forEach(lead => {
                criarCardLead(lead);
            });

            // Inicializa o Sortable após carregar os cards
            initKanban();

        } catch (error) {
            console.error('Erro:', error);
            // Dados de teste para visualizar o funcionamento sem a API:
            // const teste = [{id: "1", nome: "Lead Teste", status_funil: "novos-leads"}];
            // teste.forEach(criarCardLead);
            // initKanban();
        }
    }

    function criarCardLead(lead) {
        const card = document.createElement('div');
        card.classList.add('kanban-card');
        
        // 6. Adiciona o id do lead ao atributo data-id
        card.setAttribute('data-id', lead.id);
        
        card.innerHTML = `<p>${lead.nome}</p>`;

        const idColuna = `coluna-${lead.status_funil}`;
        const colunaDestino = document.getElementById(idColuna);

        if (colunaDestino) {
            colunaDestino.appendChild(card);
        }
    }

    // 1. Função para inicializar o Drag and Drop
    function initKanban() {
        // 2. Seleciona todas as colunas
        const colunas = document.querySelectorAll('.kanban-column');

        // 3. Itera sobre cada coluna
        colunas.forEach(coluna => {
            // 4. Inicializa o SortableJS
            new Sortable(coluna, {
                group: 'kanban', // Permite mover entre colunas com o mesmo nome de grupo
                animation: 150,
                ghostClass: 'sortable-ghost',
                
                // 5. Evento disparado ao soltar um card
                onEnd: function (evt) {
                    const leadId = evt.item.getAttribute('data-id'); // ID do card movido
                    const novaColunaId = evt.to.id; // ID da coluna onde o card caiu
                    
                    // Extrai apenas o status do ID da coluna (ex: 'coluna-ganhos' vira 'ganhos')
                    const novoStatus = novaColunaId.replace('coluna-', '');

                    console.log(`Movendo lead ${leadId} para ${novoStatus}`);
                    
                    // Chama a função para atualizar no banco de dados/API
                    updateLeadStatus(leadId, novoStatus);
                }
            });
        });
    }

    // 5.c. Função para enviar a atualização para o servidor
    async function updateLeadStatus(leadId, novoStatus) {
        try {
            const response = await fetch(URL_API, {
                method: 'POST',
                // Necessário para o Google Apps Script receber como JSON (ajuste conforme sua API)
                body: JSON.stringify({
                    action: "updateStatus",
                    id: leadId,
                    novoStatus: novoStatus
                })
            });

            const result = await response.json();
            console.log('Sucesso:', result);
        } catch (error) {
            console.error('Erro ao atualizar status:', error);
        }
    }

    fetchLeads();
});
