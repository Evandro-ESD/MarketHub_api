CREATE DATABASE IF NOT EXISTS market_hub;
USE market_hub;

-- Tabela de Usuáriosss
CREATE TABLE Usuarios (
    id_usuario INT PRIMARY KEY AUTO_INCREMENT,
    nome VARCHAR(100) NOT NULL,
    senha VARCHAR(255) NOT NULL, -- senha criptografada com bcrypt
    perfil ENUM('COMPRADOR', 'VENDEDOR') NOT NULL
);

-- Tabela de Produtos
CREATE TABLE Produtos (
    id_produto INT PRIMARY KEY AUTO_INCREMENT,
    nome_produto VARCHAR(100) NOT NULL,
    descricao TEXT,
    preco DECIMAL(10,2) NOT NULL,
    estoque INT NOT NULL,
    id_vendedor INT NOT NULL,
    FOREIGN KEY (id_vendedor) REFERENCES Usuarios(id_usuario)
);

-- Tabela de Pedidos
CREATE TABLE Pedidos (
    id_pedido INT PRIMARY KEY AUTO_INCREMENT,
    id_comprador INT NOT NULL,
    data_pedido DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    status_pedido VARCHAR(50) NOT NULL,
    total DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (id_comprador) REFERENCES Usuarios(id_usuario)
);

-- Tabela de Itens do Pedido
CREATE TABLE ItensPedido (
    id_item_pedido INT PRIMARY KEY AUTO_INCREMENT,
    id_pedido INT NOT NULL,
    id_produto INT NOT NULL,
    quantidade INT NOT NULL,
    preco_unitario DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (id_pedido) REFERENCES Pedidos(id_pedido),
    FOREIGN KEY (id_produto) REFERENCES Produtos(id_produto)
);

ALTER TABLE market_hub.usuarios
ADD COLUMN foto VARCHAR(255) NULL AFTER perfil,
ADD COLUMN authtoken VARCHAR(512) NULL AFTER foto;

INSERT INTO market_hub.usuarios (nome, senha, perfil, foto, authtoken) VALUES
('João Silva',    '123456', 'COMPRADOR', 'https://cdn.market-hub.com/users/joao.jpg',   'token_joao_abc123'),
('Maria Santos',  '654321', 'VENDEDOR',  'https://cdn.market-hub.com/users/maria.jpg',  'token_maria_def456'),
('Carlos Souza',  '111222', 'COMPRADOR', 'https://cdn.market-hub.com/users/carlos.jpg', 'token_carlos_ghi789'),
('Ana Oliveira',  '333444', 'VENDEDOR',  'https://cdn.market-hub.com/users/ana.jpg',    'token_ana_jkl012'),
('Pedro Rocha',   '999888', 'COMPRADOR', 'https://cdn.market-hub.com/users/pedro.jpg',  'token_pedro_mno345');

INSERT INTO market_hub.produtos (nome_produto, descricao, preco, estoque, id_vendedor) VALUES
('Notebook Dell Inspiron', 'Notebook i7 16GB RAM SSD 512GB', 3500.00, 10, 2), -- Vendedor Maria (id_usuario=2)
('Smartphone Samsung Galaxy', 'Galaxy S22 128GB 8GB RAM', 2800.00, 15, 2),   -- Maria
('Cadeira Gamer Redragon', 'Cadeira gamer ergonômica com ajuste de altura', 1200.00, 5, 4), -- Ana (id_usuario=4)
('Teclado Mecânico Logitech', 'Teclado mecânico RGB switches blue', 450.00, 20, 4),        -- Ana
('Monitor LG UltraWide', 'Monitor 29 polegadas Full HD UltraWide', 1600.00, 8, 2);         -- Maria

INSERT INTO market_hub.pedidos (id_comprador, data_pedido, status_pedido, total) VALUES
(1, '2025-08-25 14:32:00', 'CRIADO', 0.00), -- João Silva
(3, '2025-08-26 09:15:00', 'CRIADO', 0.00), -- Carlos Souza
(5, '2025-08-26 18:47:00', 'CRIADO', 0.00); -- Pedro Rocha

-- Pedido 1 (João Silva)
INSERT INTO market_hub.itenspedido (id_pedido, id_produto, quantidade, preco_unitario) VALUES
(1, 1, 1, 3500.00),  -- Notebook Dell (Maria)
(1, 4, 2, 450.00);   -- 2x Teclado Logitech (Ana)

-- Pedido 2 (Carlos Souza)
INSERT INTO market_hub.itenspedido (id_pedido, id_produto, quantidade, preco_unitario) VALUES
(2, 2, 1, 2800.00),  -- Smartphone Samsung (Maria)
(2, 3, 1, 1200.00);  -- Cadeira Gamer (Ana)

-- Pedido 3 (Pedro Rocha)
INSERT INTO market_hub.itenspedido (id_pedido, id_produto, quantidade, preco_unitario) VALUES
(3, 5, 2, 1600.00);  -- 2x Monitor LG (Maria)


alter table market_hub.produtos
ADD COLUMN foto VARCHAR(255) NULL AFTER descricao;