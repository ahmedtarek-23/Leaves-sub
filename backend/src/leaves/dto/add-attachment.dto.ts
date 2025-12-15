import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class AddAttachmentDto {
    @IsString()
    @IsNotEmpty()
    fileUrl: string;

    @IsString()
    @IsNotEmpty()
    fileName: string;

    @IsString()
    @IsNotEmpty()
    fileType: string;

    @IsString()
    @IsNotEmpty()
    uploadedBy: string;

    @IsString()
    @IsOptional()
    documentType?: string;
}
