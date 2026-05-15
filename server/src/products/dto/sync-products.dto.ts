import { IsArray, IsBoolean, IsEnum, IsInt, IsOptional, IsString, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum ProductCategory {
  main_surprise = 'main_surprise',
  sweet_pick = 'sweet_pick',
  tiny_extra = 'tiny_extra',
  lucky_bonus = 'lucky_bonus',
}

export enum Audience {
  for_her = 'for_her',
  for_him = 'for_him',
  couple = 'couple',
  neutral = 'neutral',
}

export enum Vibe {
  romantic = 'romantic',
  cute = 'cute',
  cozy = 'cozy',
  luxury = 'luxury',
  funny = 'funny',
  soft = 'soft',
  gamer = 'gamer',
  aesthetic = 'aesthetic',
}

export class SyncProductDto {
  @ApiProperty()
  @IsString()
  externalId: string;

  @ApiProperty()
  @IsString()
  title: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Normal retail price in GEL tetri (1 GEL = 100)' })
  @IsInt()
  @Min(0)
  normalPrice: number;

  @ApiProperty({ description: 'Discounted box price in GEL tetri' })
  @IsInt()
  @Min(0)
  boxPrice: number;

  @ApiProperty({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  images: string[];

  @ApiProperty()
  @IsInt()
  @Min(0)
  stock: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  active?: boolean;

  @ApiProperty({ enum: ProductCategory })
  @IsEnum(ProductCategory)
  category: ProductCategory;

  @ApiPropertyOptional({ enum: Audience })
  @IsOptional()
  @IsEnum(Audience)
  audience?: Audience;

  @ApiPropertyOptional({ enum: Vibe, isArray: true })
  @IsOptional()
  @IsArray()
  @IsEnum(Vibe, { each: true })
  vibes?: Vibe[];

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}

export class SyncProductsBatchDto {
  @ApiProperty({ type: [SyncProductDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SyncProductDto)
  products: SyncProductDto[];
}
