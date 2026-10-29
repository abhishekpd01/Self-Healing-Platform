output "cluster_name" {
  value = google_container_cluster.gke.name
}

output "cluster_zone" {
  value = google_container_cluster.gke.location
}

output "jenkins_external_ip" {
  value = google_compute_instance.jenkins.network_interface[0].access_config[0].nat_ip
}

output "artifact_registry_repository" {
  value = google_artifact_registry_repository.docker_repo.name
}