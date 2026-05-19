-- Thêm Pipeline Stages
INSERT INTO public.pipeline_stages (name, order_index) VALUES 
('Mới', 1), ('Đang tư vấn', 2), ('Gửi báo giá', 3), ('Đàm phán', 4), ('Chốt đơn', 5), ('Thất bại', 6);

-- Mock Data Khách hàng
INSERT INTO public.leads (name, phone_1, email, segment, product_interest) VALUES
('Nguyễn Thùy Linh (Hương Việt)', '0901111111', 'linh@huongviet.com', 'Đại lý', '{"Yến tinh chế", "Yến chưng"}'),
('Trần Minh Quân (An Phát)', '0902222222', 'quan@anphat.vn', 'Đại lý', '{"Yến thô", "Yến tinh chế"}'),
('Lê Bảo Anh', '0903333333', 'baoanh@gmail.com', 'VIP', '{"Yến chưng", "Yến tinh chế"}'),
('Phạm Ngọc Hưng (Sài Gòn Event)', '0904444444', 'hung@saigonevent.com', 'Đại lý', '{"Yến chưng", "Yến tinh chế"}'),
('Vũ Thu Trang (An Nhiên)', '0905555555', 'trang@annhien.vn', 'Đại lý', '{"Yến thô", "Yến chưng"}'),
('Đặng Quốc Khánh', '0906666666', 'khanhdq@gmail.com', 'Khách lẻ', '{"Yến chưng", "Yến tinh chế"}');
