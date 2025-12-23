# -----------------------------------------------------------
# terraform/main.tf
# Defines the AWS infrastructure resources for the Staging environment.
# -----------------------------------------------------------

# 1. Terraform Block: Defines required providers and backend
terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  # THIS IS THE CRITICAL MISSING PIECE
  # This stores your state in the cloud so GitHub and CloudShell see the same thing.
  backend "s3" {
    bucket  = "tams-terraform-state-486893719423" # Ensure this bucket exists in S3!
    key     = "staging/terraform.tfstate"
    region  = "eu-central-1"
    encrypt = true
  }
}

# 2. Provider Configuration
provider "aws" {
  region = var.aws_region
}

# 3. AWS ECR Repositories 
# Re-adding these here ensures they are managed by the main state file.
resource "aws_ecr_repository" "frontend_repo" {
  name                 = "${var.project_name}-${var.environment}-frontend"
  image_tag_mutability = "MUTABLE"
}

resource "aws_ecr_repository" "backend_repo" {
  name                 = "${var.project_name}-${var.environment}-backend"
  image_tag_mutability = "MUTABLE"
}

# 4. AWS ECS Cluster
resource "aws_ecs_cluster" "main_cluster" {
  name = "${var.project_name}-${var.environment}-cluster"
}

# 5. CloudWatch Log Groups
resource "aws_cloudwatch_log_group" "backend_log_group" {
  name              = "/ecs/${var.project_name}-${var.environment}-backend"
  retention_in_days = 7
}

resource "aws_cloudwatch_log_group" "frontend_log_group" {
  name              = "/ecs/${var.project_name}-${var.environment}-frontend"
  retention_in_days = 7
}

# 6. IAM Role Policy Attachment
# Reference the role created in task_definition.tf
resource "aws_iam_role_policy_attachment" "ecs_task_execution_policy" {
  role       = "tams-app-staging-execution-role"
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}