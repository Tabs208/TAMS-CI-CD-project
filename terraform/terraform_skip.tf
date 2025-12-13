# This block is a temporary solution to resolve the RepositoryAlreadyExistsException
# It instructs Terraform to adopt the existing ECR repositories into its state.

resource "aws_ecr_repository" "frontend_repo" {
  name = "tams-app-staging-frontend"
  lifecycle {
    # IMPORTANT: Tells Terraform to skip any changes to this resource
    prevent_destroy = false
    ignore_changes = all
  }
}

resource "aws_ecr_repository" "backend_repo" {
  name = "tams-app-staging-backend"
  lifecycle {
    # IMPORTANT: Tells Terraform to skip any changes to this resource
    prevent_destroy = false
    ignore_changes = all
  }
}