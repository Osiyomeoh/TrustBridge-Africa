import { Controller, Get, Post, Body, Param, Query, Put } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { AttestorsService, ExternalPartyData, AttestationData, PerformanceData } from './attestors.service';

@ApiTags('Attestors')
@Controller('attestors')
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

  @Post('apply')
  @ApiOperation({ summary: 'Apply to become an attestor (manual or automated verification)' })
  @ApiResponse({ status: 201, description: 'Attestor application submitted successfully' })
  async applyAsAttestor(@Body() applicationData: any) {
    try {
      // Check if this is a manual verification application
      if (applicationData.verificationType === 'manual_verification') {
        const result = await this.attestorsService.processManualAttestorApplication(applicationData);
        return {
          success: true,
          data: result.data,
          message: result.message
        };
      } else {
        // Use the existing hybrid verification process
        const result = await this.attestorsService.processAttestorApplication(applicationData);
        return {
          success: true,
          data: result,
          message: 'Attestor application submitted successfully and pending verification'
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to submit attestor application'
      };
    }
  }

  @Get('applications')
  @ApiOperation({ summary: 'Get all attestor applications for admin review' })
  @ApiResponse({ status: 200, description: 'List of attestor applications' })
  async getAttestorApplications() {
    try {
      const applications = await this.attestorsService.getAllAttestorApplications();
      return {
        success: true,
        data: applications,
        message: `Found ${applications.length} attestor applications`
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to get attestor applications'
      };
    }
  }

  @Put('applications/:id/approve')
  @ApiOperation({ summary: 'Approve attestor application' })
  @ApiParam({ name: 'id', description: 'Application ID' })
  @ApiResponse({ status: 200, description: 'Application approved successfully' })
  async approveAttestorApplication(
    @Param('id') id: string,
    @Body() body: { reviewerNotes?: string }
  ) {
    try {
      const result = await this.attestorsService.approveAttestorApplication(id, body.reviewerNotes);
      return {
        success: true,
        data: result,
        message: 'Attestor application approved successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to approve application'
      };
    }
  }

  @Put('applications/:id/reject')
  @ApiOperation({ summary: 'Reject attestor application' })
  @ApiParam({ name: 'id', description: 'Application ID' })
  @ApiResponse({ status: 200, description: 'Application rejected successfully' })
  async rejectAttestorApplication(
    @Param('id') id: string,
    @Body() body: { reviewerNotes?: string }
  ) {
    try {
      const result = await this.attestorsService.rejectAttestorApplication(id, body.reviewerNotes);
      return {
        success: true,
        data: result,
        message: 'Attestor application rejected'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to reject application'
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
