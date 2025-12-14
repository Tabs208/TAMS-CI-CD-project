# -----------------------------------------------------------
# terraform/ecs_service.tf
# Defines the ECS Services and Security Groups (AZ FIX APPLIED)
# -----------------------------------------------------------

# 1. ECS Service Security Group
# This SG allows traffic ONLY from the ALB (Source: alb_sg) to the container ports (80 and 5000)
resource "aws_security_group" "ecs_tasks_sg" {
  name        = "${var.project_name}-${var.environment}-ecs-tasks-sg"
  description = "Controls access to the ECS Fargate Tasks"
  vpc_id      = aws_vpc.main.id

  # Ingress: Allow traffic from the ALB's security group to the container ports
  ingress {
    from_port       = 80      # Frontend port
    to_port         = 80
    protocol        = "tcp"
    security_groups = [aws_security_group.alb_sg.id]
  }

  ingress {
    from_port       = 5000    # Backend port
    to_port         = 5000
    protocol        = "tcp"
    security_groups = [aws_security_group.alb_sg.id]
  }

  # Egress: Allow all outbound traffic (Fargate needs this to pull images and talk to other services)
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

# 2. Frontend ECS Service
resource "aws_ecs_service" "frontend" {
  name            = "${var.project_name}-${var.environment}-frontend-service"
  cluster         = aws_ecs_cluster.main_cluster.id
  task_definition = aws_ecs_task_definition.frontend_task.arn
  launch_type     = "FARGATE"
  desired_count   = 1 # Run 1 instance of the frontend

  network_configuration {
    # FIX: Tasks must run across multiple private subnets (AZ 1 and AZ 2)
    subnets          = [aws_subnet.private_1.id, aws_subnet.private_2.id] 
    security_groups  = [aws_security_group.ecs_tasks_sg.id]
    assign_public_ip = true
  }

  # Link the service to the ALB
  load_balancer {
    target_group_arn = aws_lb_target_group.frontend.arn
    container_name   = "frontend"
    container_port   = 80
  }

  # Ensure resources are created in order
  depends_on = [
    aws_lb_listener.http,
    aws_lb_listener_rule.backend_api
  ]
}

# 3. Backend ECS Service
resource "aws_ecs_service" "backend" {
  name            = "${var.project_name}-${var.environment}-backend-service"
  cluster         = aws_ecs_cluster.main_cluster.id
  task_definition = aws_ecs_task_definition.backend_task.arn
  launch_type     = "FARGATE"
  desired_count   = 1 # Run 1 instance of the backend

  network_configuration {
    # FIX: Tasks must run across multiple private subnets (AZ 1 and AZ 2)
    subnets          = [aws_subnet.private_1.id, aws_subnet.private_2.id] 
    security_groups  = [aws_security_group.ecs_tasks_sg.id]
    assign_public_ip = true
  }

  # Link the service to the ALB
  load_balancer {
    target_group_arn = aws_lb_target_group.backend.arn
    container_name   = "backend"
    container_port   = 5000
  }

  depends_on = [
    aws_lb_listener.http,
    aws_lb_listener_rule.backend_api
  ]
}