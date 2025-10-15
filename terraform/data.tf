data "aws_iam_policy_document" "lambda_assume_role_policy" {
  statement {
    effect = "Allow"

    principals {
      type        = "Service"
      identifiers = ["lambda.amazonaws.com"]
    }

    actions = ["sts:AssumeRole"]
  }
}

data "archive_file" "lambda_zip" {
  type        = "zip"
  source_dir  = "${path.module}/../dist/handlers/payment"
  output_path = "${path.module}/dist/payment.zip"
}

data "aws_caller_identity" "current" {}

data "aws_iam_policy_document" "lambda_payment_policy_document" {
  version = "2012-10-17"

  statement {
    effect = "Allow"
    actions = [
      "dynamodb:GetItem",
      "dynamodb:Query",
      "dynamodb:Scan"
    ]

    resources = ["arn:aws:dynamodb:${var.app_region}:${data.aws_caller_identity.current.account_id}:table/${var.card_table_name}"]
  }
}
