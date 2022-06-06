
1:
## commands To Deploy this CDK stask
* `cdk synth`       emits the synthesized CloudFormation template  
* `cdk synth > template.yaml` To Write synthesized CloudFormation template in a yaml file  
* `cdk diff`        compare deployed stack with current state
* `cdk deploy --parameters S3BucketName=<Bucket-Name>` Deploy the CDK stack and Provide the Required Parameters


2:
## Instructions for the SpringBootHelloWorld Github Project.
* Github Repo Link   https://github.com/shahwaseem775/gitHubActionsDeployToEc2CDK
  Fork this repo to your account and perform the below steps.

* Navigate to your github repository. Select the Settings tab.
* Select Secrets on the left menu bar.
* Select New repository secret.
* Select Actions under Secrets.
* Enter the secret name as ‘IAMROLE_GITHUB’.
* Enter the value as ARN of <OIDCGithubRoleCDK>, Role (Copy the Arn from the AWS IAM Role Console).

3:
## Changes to be made in gitHub's Project
* Navigate to <Deploy.sh> file under <".github/workflows"> folder and do some Changes as Mentioned Below.
* Change the Update <AWS_REGION> to Your Current Aws Region.
* Change the <S3BUCKET> Name to Your Own Bucket (As Provided to CDK deploy command as a parameter).
* Navigate to the <after-install.sh> file under <aws/scripts> folder and do some Changes as Mentioned Below.
* Replace the S3 Bucket with Your Own bucket in the command
 aws s3 cp s3://<S3BUCKET>/SpringBootHelloWorldExampleApplication.war /usr/local/tomcat9/webapps/SpringBootHelloWorldExampleApplication.war

4: 
*** After Performing all the Above steps commit and push the changes.*** 
