FROM centos:latest

RUN curl --silent --location https://rpm.nodesource.com/setup_10.x | bash -
RUN yum install -q -y nodejs

RUN mkdir -p /opt/jsfiddle
WORKDIR /opt/jsfiddle

RUN useradd -m -d /home/centos -s /bin/bash centos
RUN chown -R centos:centos /opt/jsfiddle
USER centos

CMD ["bash"]
