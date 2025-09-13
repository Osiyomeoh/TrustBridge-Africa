import { Controller, Get, Post, Body, Param, Query, Put } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { AttestorsService, ExternalPartyData, AttestationData, PerformanceData } from './attestors.service';

@ApiTags('Attestors')
@Controller('api/attestors')
export class AttestorsController {
  constructor(private readonly attestorsService: AttestorsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all attestors' })
  @ApiResponse({ status: 200, description: 'List of attestors' })
  async getAttestors() {
    try {
      const attestors = await this.attestorsService.getAllAttestors();
      return {
        success: true,
        data: attestors,
        message: `Found ${attestors.length} attestors`
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to get attestors'
      };
    }
  }

  @Post('register')
  @ApiOperation({ summary: 'Register new external party as attestor' })
  @ApiResponse({ status: 201, description: 'External party registered successfully' })
  async registerExternalParty(@Body() partyData: ExternalPartyData) {
    try {
      const attestor = await this.attestorsService.registerExternalParty(partyData);
      return {
        success: true,
        data: attestor,
        message: 'External party registered successfully and pending approval'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to register external party'
      };
    }
  }

  @Get('location/:country')
  @ApiOperation({ summary: 'Get attestors by location' })
  @ApiParam({ name: 'country', description: 'Country code' })
  @ApiQuery({ name: 'region', required: false, description: 'Region/state' })
  @ApiResponse({ status: 200, description: 'List of attestors in location' })
  async getAttestorsByLocation(
    @Param('country') country: string,
    @Query('region') region?: string
  ) {
    try {
      const attestors = await this.attestorsService.getAttestorsByLocation(country, region);
      return {
        success: true,
        data: attestors,
        message: `Found ${attestors.length} attestors in ${country}${region ? `, ${region}` : ''}`
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to get attestors by location'
      };
    }
  }

  @Get('specialty/:specialty')
  @ApiOperation({ summary: 'Get attestors by specialty' })
  @ApiParam({ name: 'specialty', description: 'Specialty type' })
  @ApiResponse({ status: 200, description: 'List of attestors with specialty' })
  async getAttestorsBySpecialty(@Param('specialty') specialty: string) {
    try {
      const attestors = await this.attestorsService.getAttestorsBySpecialty(specialty);
      return {
        success: true,
        data: attestors,
        message: `Found ${attestors.length} attestors with ${specialty} specialty`
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to get attestors by specialty'
      };
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get attestor by ID' })
  @ApiParam({ name: 'id', description: 'Attestor ID' })
  @ApiResponse({ status: 200, description: 'Attestor details' })
  async getAttestor(@Param('id') id: string) {
    try {
      const attestor = await this.attestorsService.getAttestor(id);
      return {
        success: true,
        data: attestor,
        message: 'Attestor details retrieved successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to get attestor details'
      };
    }
  }

  @Post(':id/attestation')
  @ApiOperation({ summary: 'Submit attestation for asset' })
  @ApiParam({ name: 'id', description: 'Attestor ID' })
  @ApiResponse({ status: 201, description: 'Attestation submitted successfully' })
  async submitAttestation(
    @Param('id') attestorId: string,
    @Body() attestationData: AttestationData
  ) {
    try {
      await this.attestorsService.submitAttestation(attestorId, attestationData);
      return {
        success: true,
        message: 'Attestation submitted successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to submit attestation'
      };
    }
  }

  @Put(':id/reputation')
  @ApiOperation({ summary: 'Update attestor reputation' })
  @ApiParam({ name: 'id', description: 'Attestor ID' })
  @ApiResponse({ status: 200, description: 'Reputation updated successfully' })
  async updateReputation(
    @Param('id') attestorId: string,
    @Body() performance: PerformanceData
  ) {
    try {
      await this.attestorsService.updateReputation(attestorId, performance);
      return {
        success: true,
        message: 'Reputation updated successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to update reputation'
      };
    }
  }

  @Put(':id/approve')
  @ApiOperation({ summary: 'Approve attestor (Admin only)' })
  @ApiParam({ name: 'id', description: 'Attestor ID' })
  @ApiResponse({ status: 200, description: 'Attestor approved successfully' })
  async approveAttestor(@Param('id') attestorId: string) {
    try {
      await this.attestorsService.approveAttestor(attestorId);
      return {
        success: true,
        message: 'Attestor approved successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to approve attestor'
      };
    }
  }

  @Put(':id/reject')
  @ApiOperation({ summary: 'Reject attestor (Admin only)' })
  @ApiParam({ name: 'id', description: 'Attestor ID' })
  @ApiResponse({ status: 200, description: 'Attestor rejected successfully' })
  async rejectAttestor(
    @Param('id') attestorId: string,
    @Body() body: { reason: string }
  ) {
    try {
      await this.attestorsService.rejectAttestor(attestorId, body.reason);
      return {
        success: true,
        message: 'Attestor rejected successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to reject attestor'
      };
    }
  }
}
