export interface Dispatch {
    created_at: Date;
    created_by: string;
    driver: string;
    id_dispatch: number;
    images: Image[];
    name_destiny: string;
    name_vehicle_type: string;
    observations: string;
    order_number: string;
    skus: Skus[];
    status: string;
    truck_license: string;
    updated_at: Date;
    updated_by: string;
    weight: null;
}

export interface Image {
    image_path: string;
    process: string;
}

export interface Skus {
    id_sku: number;
    products: Product[];
    type_sku: string;
}

export interface Product {
    id_product: number;
    name: string;
    quantity: number;
}
