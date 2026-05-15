import { IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateBoxDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  sessionToken?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  mainSurpriseId?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  sweetPickId?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  tinyExtraId?: string | null;
}
