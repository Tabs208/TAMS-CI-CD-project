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

# 3. AWS ECR Repositories (REMOVED: Now handled by terraform_skip.tf)

# 4. AWS ECS Cluster (The container management service)
resource "aws_ecs_cluster" "main_cluster" {
  name = "${var.project_name}-${var.environment}-cluster"
}

# 5. Outputs (CRITICAL for pipeline to get URIs)
# These outputs still reference the resources, whose definition is now in terraform_skip.tf


# NOTE: A production-ready environment requires defining VPCs, Load Balancers, 
# and ECS Services/Task Definitions, but the ECR and ECS Cluster resources are 
# sufficient to demonstrate the IaC and deployment concept for the paper.