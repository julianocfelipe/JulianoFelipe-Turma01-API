import * as pactum from 'pactum';

describe('Company API Tests', () => {
  const baseUrl = 'https://api-desafio-qa.onrender.com';
  let createdCompanyId: number;

  it('Deve pegar todas as empresas', async () => {
    await pactum
      .spec()
      .get(`${baseUrl}/company`)
      .expectStatus(200)
      .expectJsonLike([]);
  });

  it('Deve criar uma nova empresa com valor valido', async () => {
    const newCompany = {
      name: 'Empresa y',
      address: 'Rua logo ali 123',
      city: 'Criciuma',
      state: 'Santa Catarina',
      country: 'Brasil',
      sector: 'Tecnologia',
      cnpj: '12344558000145'
    };

    const response = await pactum
      .spec()
      .post(`${baseUrl}/company`)
      .withJson(newCompany)
      .expectStatus(201)
      .expectJsonLike({
        id: /\d+/,
        name: 'Empresa y'
      });

    
    createdCompanyId = response.body.id;
  });

  it('Deve pegar a empresa pelo ID', async () => {
    await pactum
      .spec()
      .get(`${baseUrl}/company/${createdCompanyId}`)
      .expectStatus(200)
      .expectJsonLike({
        id: createdCompanyId
      });
  });

  it('Deve atualizar a empresa pelo ID com dados validos', async () => {
    const updateData = {
      name: 'Empresa y atualizado',
      state: 'Santa Catarina atualizado',
      sector: 'Tecnologia e Informatica',
      cnpj: '11445889000198'
    };

    await pactum
      .spec()
      .put(`${baseUrl}/company/${createdCompanyId}`)
      .withJson(updateData)
      .expectStatus(200)
      .expectJsonLike({
        message: 'Empresa atualizada com sucesso',
        company: {
          id: createdCompanyId,
          name: 'Empresa y atualizado',
          cnpj: '11445889000198',
          state: 'Santa Catarina atualizado',
          sector: 'Tecnologia e Informatica'
        }
      });
  });

  it('Deve deletar uma empresa pelo ID', async () => {
    await pactum
      .spec()
      .delete(`${baseUrl}/company/${createdCompanyId}`)
      .expectStatus(200);
  });

  it('Deve retornar 404 por pegar um empresa não existente', async () => {
    const nonExistingId = 9999;

    await pactum
      .spec()
      .get(`${baseUrl}/company/${nonExistingId}`)
      .expectStatus(404);
  });

  it('Deve retornar 400 quando criar uma empresa sem algum campos requeridos', async () => {
    const invalidCompany = {
      name: 'empresa invalida'
      // faltam 'cnpj', 'state', 'sector', 'address', etc.
    };

    await pactum
      .spec()
      .post(`${baseUrl}/company`)
      .withJson(invalidCompany)
      .expectStatus(400)
      .expectJsonLike({
        errors: [
          { msg: 'CNPJ deve ter 14 dígitos' },
          { msg: 'Estado é obrigatório' },
          { msg: 'Setor é obrigatório' }
        ]
      });
  });

  it('Deve retornar 400 quando criado uma empresa com CNPJ invalido', async () => {
    const invalidCompany = {
      name: 'empresa com CNPJ invalido',
      address: '123 rua test',
      city: 'Criciteste',
      state: 'Estado teste',
      country: 'Testado',
      sector: 'testetecnology',
      cnpj: 'cnpjinvalido'
    };

    await pactum
      .spec()
      .post(`${baseUrl}/company`)
      .withJson(invalidCompany)
      .expectStatus(400)
      .expectJsonLike({
        errors: [
          { msg: 'CNPJ deve conter apenas números' },
          { msg: 'CNPJ deve ter 14 dígitos' }
        ]
      });
  });

  it('Deve retornar 400 quando atualizar uma empresa com CNPJ invalido', async () => {
    const updateData = {
      name: 'Empresa y atualizada',
      cnpj: 'cnpjerrado'
    };

    await pactum
      .spec()
      .put(`${baseUrl}/company/${createdCompanyId}`)
      .withJson(updateData)
      .expectStatus(400)
      .expectJsonLike({
        errors: [
          { msg: 'CNPJ deve conter apenas números' },
          { msg: 'CNPJ deve ter 14 dígitos' }
        ]
      });
  });

  it('Deve retornar 400 quando atualizar uma empresa que não existe', async () => {
    const nonExistingId = 9999;
    const updateData = {
      name: 'Empresa não existente'
    };

    await pactum
      .spec()
      .put(`${baseUrl}/company/${nonExistingId}`)
      .withJson(updateData)
      .expectStatus(404);
  });

  it('Deve retornar 404 se tentar deletar uma empresa que não existe', async () => {
    const nonExistingId = 99999;

    await pactum
      .spec()
      .delete(`${baseUrl}/company/${nonExistingId}`)
      .expectStatus(404);
  });

  it('Deve retornar 400 quando criado uma empresa com CNPJ duplicado', async () => {
    const duplicateCompany = {
      name: 'Teste cnpj duplicado',
      address: '1234 rua teste',
      city: 'teste cidade',
      state: 'teste estado',
      country: 'pais teste',
      sector: 'Technology',
      cnpj: '11445889000198'
    };

    await pactum
      .spec()
      .post(`${baseUrl}/company`)
      .withJson(duplicateCompany)
      .expectStatus(400)
      .expectJsonLike({
        errors: [{ msg: 'CNPJ já está cadastrado' }]
      });
  });

  it('Deve criar multiplas empresas e recuperalas', async () => {
    const companies = [
      {
        name: 'Empresa A',
        address: '456 rua tal',
        city: 'cidade A',
        state: 'estado A',
        country: 'pais A',
        sector: 'Finanças',
        cnpj: '12345678000155'
      },
      {
        name: 'Empresa B',
        address: '789 rua nao sei',
        city: 'cidade B',
        state: 'estado B',
        country: 'pais B',
        sector: 'Advocacia',
        cnpj: '12345678000149'
      }
    ];

    
    for (const company of companies) {
      const response = await pactum
        .spec()
        .post(`${baseUrl}/company`)
        .withJson(company)
        .expectStatus(201);
    }

    
    const response = await pactum
      .spec()
      .get(`${baseUrl}/company`)
      .expectStatus(200);

    expect(response.body.length).toBeGreaterThanOrEqual(2);
  });

  it('Deve retornar 405 para metodo invalido em /company', async () => {
    await pactum.spec().patch(`${baseUrl}/company`).expectStatus(405);
  });

  it('Deve retornar 405 para metodo invalido em /company/:id', async () => {
    await pactum
      .spec()
      .patch(`${baseUrl}/company/${createdCompanyId}`)
      .expectStatus(405);
  });
});
