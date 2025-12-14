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
# Add these resource blocks back into your main.tf file:
resource "aws_ecr_repository" "frontend_repo" {
  name = "${var.project_name}-${var.environment}-frontend"
  image_tag_mutability = "MUTABLE"
}

resource "aws_ecr_repository" "backend_repo" {
  name = "${var.project_name}-${var.environment}-backend"
  image_tag_mutability = "MUTABLE"
}

# NOTE: A production-ready environment requires defining VPCs, Load Balancers, 
# and ECS Services/Task Definitions, but the ECR and ECS Cluster resources are 
# sufficient to demonstrate the IaC and deployment concept for the paper.
# -----------------------------------------------------------
# New Resources for ECS Task Execution and Logging
# -----------------------------------------------------------

# 1. CloudWatch Log Groups (Containers will write logs here)
resource "aws_cloudwatch_log_group" "backend_log_group" {
  name = "/ecs/${var.project_name}-${var.environment}-backend"
  retention_in_days = 7
}

resource "aws_cloudwatch_log_group" "frontend_log_group" {
  name = "/ecs/${var.project_name}-${var.environment}-frontend"
  retention_in_days = 7
}

# 2. IAM Role Policy Attachment
# Attaches the standard AWS policy allowing the ECS Task Execution Role 
# (defined in task_definition.tf) to pull ECR images and write logs to CloudWatch.
resource "aws_iam_role_policy_attachment" "ecs_task_execution_policy" {
  role       = aws_iam_role.ecs_task_execution_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}