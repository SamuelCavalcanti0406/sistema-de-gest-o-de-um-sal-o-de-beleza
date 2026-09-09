const clienteRepository = require('../repositories/clienteRepository');

class ClienteService {
    async listarTodos() {
        return await clienteRepository.listarTodos();
    }

    async criar(cliente) {
        if (!cliente.nome || !cliente.telefone) {
            throw new Error("Nome e telefone são obrigatórios para o cadastro.");
        }
        return await clienteRepository.criar(cliente);
    }
    async atualizar(id, cliente) {
        if (!id) {
            throw new Error("ID do cliente é obrigatório para atualização!!! sim é obrigatório.");
        }
        if(!cliente.nome || !cliente.telefone) {    
            throw new Error("NOME e TELEFONE são obrigatórios para a atualização.");
        }
        await clienteRepository.atualizar(id, cliente);
   }
     async deletar(id){
        if (!id) {
            throw new Error("ID do cliente é obrigatório para exclusão!!! sim é obrigatório.");
        }
        await clienteRepository.deletar(id);
     }
}
module.exports = new ClienteService();