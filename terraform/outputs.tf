# -----------------------------------------------------------
# terraform/outputs.tf
# Outputs necessary data for the pipeline or end-user.
# -----------------------------------------------------------

output "frontend_ecr_uri" {
  description = "URI of the Frontend ECR Repository"
  value       = aws_ecr_repository.frontend_repo.repository_url
}

output "backend_ecr_uri" {
  description = "URI of the Backend ECR Repository"
  value       = aws_ecr_repository.backend_repo.repository_url
}

output "ecs_cluster_name" {
  description = "Name of the ECS Cluster"
  value       = aws_ecs_cluster.main_cluster.name
}

output "alb_dns_name" {
  description = "The DNS name of the Application Load Balancer."
  value       = aws_lb.main.dns_name
}