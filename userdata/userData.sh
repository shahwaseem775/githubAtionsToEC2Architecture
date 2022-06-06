#!/bin/bash
yum  install -y java-1.8.0-openjdk-devel wget
java -version
cd /usr/local
wget https://archive.apache.org/dist/tomcat/tomcat-9/v9.0.43/bin/apache-tomcat-9.0.43.zip
wget https://archive.apache.org/dist/tomcat/tomcat-9/v9.0.43/bin/apache-tomcat-9.0.43.zip.asc
wget https://archive.apache.org/dist/tomcat/tomcat-9/v9.0.43/bin/apache-tomcat-9.0.43.zip.sha512
# verify hash / are these two outputs the same
cat apache-tomcat-9.0.43.zip.sha512
sha512sum apache-tomcat-9.0.43.zip
gpg --keyserver pgpkeys.mit.edu --recv-key A9C5DF4D22E99998D9875A5110C01C5A2F6059E7
gpg --verify apache-tomcat-9.0.43.zip.asc apache-tomcat-9.0.43.zip
# if hash and signature are ok:
unzip apache-tomcat-9.0.43.zip
mv apache-tomcat-9.0.43 tomcat9
echo 'JAVA_OPTS="$JAVA_OPTS -Djava.net.preferIPv4Stack=true -Djava.net.preferIPv4Addresses=true "' > /usr/local/tomcat9/bin/setenv.sh
ls -la tomcat9/
useradd -r tomcat
chown -R tomcat:tomcat /usr/local/tomcat9
ls -l /usr/local/tomcat9
echo "[Unit]
Description=Apache Tomcat Server
After=syslog.target network.target
[Service]
Type=forking
User=tomcat
Group=tomcat
Environment=CATALINA_PID=/usr/local/tomcat9/temp/tomcat.pid
Environment=CATALINA_HOME=/usr/local/tomcat9
Environment=CATALINA_BASE=/usr/local/tomcat9
ExecStart=/usr/local/tomcat9/bin/catalina.sh start
ExecStop=/usr/local/tomcat9/bin/catalina.sh stop
RestartSec=10
Restart=always
[Install]
WantedBy=multi-user.target" > /etc/systemd/system/tomcat.service
# firewall-cmd --zone=public --permanent --add-port=8080/tcp
# firewall-cmd --zone=public --permanent --add-port=8443/tcp
# firewall-cmd --reload
cd /usr/local/tomcat9/bin && chmod +x catalina.sh
systemctl daemon-reload
systemctl start tomcat.service
systemctl enable tomcat.service
systemctl status tomcat.service
yum install ruby -y
wget https://aws-codedeploy-us-east-1.s3.us-east-1.amazonaws.com/latest/install
chmod +x ./install
./install auto
cd /tmp
yum install -y https://s3.amazonaws.com/ec2-downloads-windows/SSMAgent/latest/linux_amd64/amazon-ssm-agent.rpm
systemctl enable amazon-ssm-agent
systemctl start amazon-ssm-agent