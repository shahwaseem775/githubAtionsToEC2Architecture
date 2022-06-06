import json
import boto3

client = boto3.client('ssm')
def lambda_handler(event, context):
    # TODO implement
    ssm = boto3.client('ssm')
    print("hello from cdk lambda")
    return {
        'statusCode': 200,
        'body': json.dumps('Hello from Lambda!')
    }
