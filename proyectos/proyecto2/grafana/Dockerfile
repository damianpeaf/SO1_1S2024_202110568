FROM grafana/grafana-oss

ADD ./provisioning /etc/grafana/provisioning

# Set environment variables
ENV GF_SECURITY_ADMIN_PASSWORD=Gr4f4n4P4ssw0rd
ENV GF_SECURITY_ADMIN_USER=admin

# install plugins (redis)
ENV GF_INSTALL_PLUGINS=redis-datasource

# Expose the port
EXPOSE 3000