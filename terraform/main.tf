# -----------------------------------------------------------
# terraform/main.tf
# Defines the AWS infrastructure resources for the Staging environment.
# -----------------------------------------------------------

# 1. Terraform Block: Defines required providers and versions
terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

# 2. Provider Configuration: Tells Terraform to use AWS
provider "aws" {
  region = var.aws_region
  # The AWS credentials will be sourced from environment variables (GitHub Secrets)
}

# 3. AWS ECR Repositories (To store your Docker Images)

# Frontend Image Registry
resource "aws_ecr_repository" "frontend_repo" {
  # Naming convention: tams-app-staging-frontend
  name = "${var.project_name}-${var.environment}-frontend"
  image_tag_mutability = "MUTABLE" 
}

# Backend Image Registry
resource "aws_ecr_repository" "backend_repo" {
  # Naming convention: tams-app-staging-backend
  name = "${var.project_name}-${var.environment}-backend"
  image_tag_mutability = "MUTABLE"
}

# 4. AWS ECS Cluster (The container management service)
resource "aws_ecs_cluster" "main_cluster" {
  name = "${var.project_name}-${var.environment}-cluster"
}

# NOTE: A production-ready environment requires defining VPCs, Load Balancers, 
# and ECS Services/Task Definitions, but the ECR and ECS Cluster resources are 
# sufficient to demonstrate the IaC and deployment concept for the paper.