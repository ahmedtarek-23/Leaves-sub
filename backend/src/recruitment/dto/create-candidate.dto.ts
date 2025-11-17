import { IsString, IsEmail, IsOptional, IsBoolean, IsEnum } from 'class-validator';

export class CreateCandidateDto {
  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsEmail()
  email: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  resumeUrl?: string;

  @IsBoolean()
  consentGiven: boolean;

  @IsEnum(['INTERNAL', 'REFERRAL', 'EXTERNAL'])
  @IsOptional()
  referralSource?: string;

  @IsString()
  @IsOptional()
  referredBy?: string; // Employee ID if referral
}