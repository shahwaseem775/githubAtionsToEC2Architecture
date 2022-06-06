import { Resource, Stack, StackProps,ScopedAws,Fn } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import {read, readFileSync} from 'fs';
import * as iam  from 'aws-cdk-lib/aws-iam'
import * as codeDeploy from 'aws-cdk-lib/aws-codedeploy'
import { Role } from 'aws-cdk-lib/aws-iam';
import { equal, strictEqual } from 'assert';
 
export class GitHubActionsStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);
    const {
      accountId,
      notificationArns,
      stackId,
      stackName,
      urlSuffix,
    } = new ScopedAws(this)

    const s3bucket = "github-projects-bucket"
const ec2s3Policy = new iam.PolicyDocument({
  statements:[new iam.PolicyStatement({
    actions:[
     "s3:getObject"
    ],
    resources: [`arn:aws:s3:::${s3bucket}/*`]
  })]
})
  const ec2iamRole = new iam.Role(this,'ec2iamRoleCDk',{
assumedBy: new iam.CompositePrincipal(
  new iam.ServicePrincipal("codedeploy.amazonaws.com"),
  new iam.ServicePrincipal('ec2.amazonaws.com')
),
roleName: "iamRoleForEc2InstanceGithubActions",
description: "this role is for the Ec2 instance to perform action on the services like ",
managedPolicies:[
  iam.ManagedPolicy.fromAwsManagedPolicyName("AmazonSSMManagedInstanceCore"),
],
inlinePolicies :{
  ec2s3Policy
}
})
const CodeDeployServiceRole = new iam.Role(this,'CodeDeployServiceRoleCDK',{
assumedBy: new iam.ServicePrincipal("codedeploy.amazonaws.com"),
roleName: "CodeDeployServiceRole",
description: "This Role will be Attached to codeDeploy Deployment Group ",
managedPolicies:[
  iam.ManagedPolicy.fromAwsManagedPolicyName("service-role/AWSCodeDeployRole"),
],
});

const OIDCProvider = new iam.OpenIdConnectProvider(this ,"OIDCProviderCDk",{
  url: 'https://token.actions.githubusercontent.com',
  clientIds: ['sts.amazonaws.com'],
  thumbprints:['6938fd4d98bab03faadb97b34396831e3780aea1'],
})

const conditions: iam.Conditions = {
  StringLike: {
    [`token.actions.githubusercontent.com:sub`]: Fn.sub (`repo:shahwaseem775/gitHubActionsDeployToEc2CDK:*`),
  },
};
const OIDCGithubRole = new iam.Role(this,"OIDCGithubRoleCDK", {
  roleName : 'OIDCGithubRoleCDK',
  assumedBy: new iam.WebIdentityPrincipal(
    OIDCProvider.openIdConnectProviderArn, {
      // conditions
    }
  ),
  inlinePolicies:{
    iampolicy: new iam.PolicyDocument({
      statements: [new iam.PolicyStatement({
        actions:[
          'codedeploy:Get*',
          'codedeploy:Batch*',
          'codedeploy:CreateDeployment',
          'codedeploy:RegisterApplicationRevision',   
          'codedeploy:List*',
          's3:putObject'
        ],
        resources: [
          `arn:aws:s3:::${s3bucket}/*`,
          `arn:aws:codedeploy:*:${accountId}:*` 
        ]
        })]})},

})

const defaultVPC = ec2.Vpc.fromLookup(this ,"myvpc",{
  isDefault : true,
});
const  newSecurityGroup  =  new ec2.SecurityGroup(
  this,
  'ec2SecurityGroup',
  {
    vpc : defaultVPC,
    allowAllOutbound:true,
    securityGroupName: 'ec2SecurityGroupCDK'
  },
);
newSecurityGroup.addIngressRule(
  ec2.Peer.anyIpv4(),
  ec2.Port.tcp(8080),
  'allow 8080 port for tomcat server access from anywhere',
);
newSecurityGroup.addIngressRule(
  ec2.Peer.anyIpv4(),
  ec2.Port.tcp(22),
  'allow 22 port for ssh',
);
const ec2Instance = new ec2.Instance(this, 'ec2-instance', {
  vpc: defaultVPC,
  vpcSubnets: {
    subnetType: ec2.SubnetType.PUBLIC,
  },
  instanceType: new ec2.InstanceType('t2.micro'),
  machineImage: new ec2.AmazonLinuxImage({
    generation: ec2.AmazonLinuxGeneration.AMAZON_LINUX_2,
  }),
  keyName: 'Ec2-key-pair',
  securityGroup : newSecurityGroup,
  instanceName:'firstCDKInstance',
  role :ec2iamRole

});
const userdatascript = readFileSync('./userdata/userData.sh', 'utf8')
ec2Instance.addUserData(userdatascript);

const codeDeployApplication = new codeDeploy.ServerApplication(this,"CodeDeployApplicationCDK",{
  applicationName: "githubActionsEC2DeployApplicationCDK",})
const DeploymentGroup = new codeDeploy.ServerDeploymentGroup(this,"githubActionsDeploymentGroupCDK",{
  application: codeDeployApplication,
  role:CodeDeployServiceRole,
  autoRollback: {failedDeployment :true},
  deploymentConfig: codeDeploy.ServerDeploymentConfig.ALL_AT_ONCE,
  deploymentGroupName: 'githubActionsDeploymentGroupCDK',
  ec2InstanceTags: new codeDeploy.InstanceTagSet({
    'Name':['firstCDKInstance']}),
})


}}