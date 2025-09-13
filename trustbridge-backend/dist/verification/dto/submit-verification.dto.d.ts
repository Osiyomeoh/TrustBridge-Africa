export declare class CoordinatesDto {
    lat: number;
    lng: number;
}
export declare class LocationDto {
    coordinates: CoordinatesDto;
    address: string;
}
export declare class DocumentDto {
    data: string;
    mimeType: string;
    fileName: string;
}
export declare class PhotoDto {
    data: string;
    mimeType: string;
    gps?: CoordinatesDto;
}
export declare class EvidenceDto {
    documents?: DocumentDto[];
    photos?: PhotoDto[];
    location?: LocationDto;
    additionalInfo?: any;
}
export declare class SubmitVerificationDto {
    assetId: string;
    evidence: EvidenceDto;
}
