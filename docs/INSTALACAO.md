# CCB Presença QR — banco de dados
O banco já recebeu as migrações por meio da integração Supabase.

Projeto: `ljaidixtmsobijzwwrdw` (região `sa-east-1`).

## Tabelas
- `operadores`: cada usuário e respectivo papel (admin, secretaria, porteiro, consulta).
- `participantes`: cadastro das pessoas.
- `credenciais_qr`: tokens aleatórios de 32 bytes, gerados por trigger.
- `eventos`: ensaios, reuniões e atividades.
- `presencas`: presença única por evento e participante.

## Segurança
RLS está ativo nas cinco tabelas. A função `registrar_entrada(p_evento uuid,p_token text)` exige operador autenticado e autorizado. O banco tem UNIQUE(evento_id, participante_id).

## Primeiro acesso
1. Em Supabase → Authentication → Users, crie o primeiro usuário autorizado.
2. Copie o UUID desse usuário.
3. No SQL Editor do projeto novo, execute substituindo o UUID:
```sql
insert into public.operadores (user_id, perfil)
values ('UUID_DO_USUARIO', 'admin');
```
4. No serviço de hospedagem, configure `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`. A chave publicável pode estar no cliente. **Nunca publique service_role nem secret key.**
5. Rode `npm install` e `npm run build` antes do deploy; testes de interface e câmera ainda pendentes.

## Observações
O repositório está atualmente público. Evite dados pessoais reais em código, commits e fixtures. Códigos QR estáticos podem ser copiados; a identificação na portaria não substitui conferência física quando necessária.
