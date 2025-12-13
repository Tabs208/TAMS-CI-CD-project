# -----------------------------------------------------------
# terraform/variables.tf
# Defines user-configurable variables for the infrastructure.
# -----------------------------------------------------------

variable "aws_region" {
  description = "The AWS region to deploy the infrastructure in."
  type        = string
  default     = "eu-central-1" # Recommended: Use Frankfurt region for common European projects
}

variable "project_name" {
  description = "The base name for all resources (e.g., TAMS)."
  type        = string
  default     = "tams-app"
}

variable "environment" {
  description = "The deployment environment (e.g., staging, production). Used in resource naming."
  type        = string
  default     = "staging"
}