variable "app_region" {
  description = "AWS region to deploy resources"
  type        = string
  sensitive   = true
}

variable "aws_access_key" {
  description = "IAM AWS's access key"
  type        = string
  sensitive   = true
}

variable "aws_secret_key" {
  description = "IAM AWS's secret key"
  type        = string
  sensitive   = true
}

variable "vpc_id" {
  description = "VPC id for lambdas"
  type        = string
}

variable "subnet_ids" {
  description = "Subnet list ids"
  type        = list(string)
}

variable "security_group_id" {
  description = "Security group id for lambdas"
  type        = string
}

variable "card_table_name" {
  description = "Card table name for dynamodb provider logic"
  type        = string
}

variable "public_route_table_id" {
  description = "VPC public route table id for dynamodb provider logic"
  type        = string
}

variable "private_route_table_id" {
  description = "VPC private route table id for dynamodb provider logic"
  type        = string
}
