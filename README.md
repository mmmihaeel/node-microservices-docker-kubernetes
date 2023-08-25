# Node Microservices with Docker and Kubernetes

This repository contains a set of microservices implemented in Node.js, along with a React client. The microservices include `users`, `tasks`, and `auth`, each of which has a Dockerfile for containerization and Kubernetes configuration for deployment.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
  - [Running Locally](#running-locally)
  - [Docker Compose](#docker-compose)
  - [Kubernetes](#kubernetes)
- [Directory Structure](#directory-structure)
- [Contributing](#contributing)
- [License](#license)

## Prerequisites

- Node.js (v14+)
- Docker
- Kubernetes (minikube or a Kubernetes cluster)

## Getting Started

### Running Locally

1. Clone this repository:

   ```sh

   git clone https://github.com/mmmihaeel/node-microservices-docker-kubernetes.git
   cd node-microservices-docker-kubernetes
   cd users-api
   npm install
   cd ../tasks-ap
   npm install
   cd ../auth-api
   npm install
   cd ../client
   npm install

   ```

2. Run with docker:
   Start the microservices and client using Docker Compose:

   ```sh

   docker-compose build
   docker-compose up

   ```

### Kubernetes

Apply Kubernetes configurations for each microservice and the client:

```sh
kubectl apply -f kubernetes/users-deployment.yaml
kubectl apply -f kubernetes/tasks-deployment.yaml
kubectl apply -f kubernetes/auth-deployment.yaml
kubectl apply -f kubernetes/client-deployment.yaml
```

Expose the services:

```sh
kubectl expose deployment users-deployment --type=LoadBalancer --port=80
kubectl expose deployment tasks-deployment --type=LoadBalancer --port=80
kubectl expose deployment auth-deployment --type=LoadBalancer --port=80
kubectl expose deployment client-deployment --type=LoadBalancer --port=80
```

Replace LoadBalancer with the appropriate service type for your environment.

### Directory Structure

node-microservices-docker-kubernetes/
├── users/
│ ├── Dockerfile
│ ├── src/
│ │ └── ... # Users microservice source files
├── tasks/
│ ├── Dockerfile
│ ├── src/
│ │ └── ... # Tasks microservice source files
├── auth/
│ ├── Dockerfile
│ ├── src/
│ │ └── ... # Auth microservice source files
├── client/
│ ├── Dockerfile
│ ├── public/
│ ├── src/
│ │ └── ... # React client source files
├── kubernetes/
│ ├── users-deployment.yaml
│ ├── tasks-deployment.yaml
│ ├── auth-deployment.yaml
│ ├── client-deployment.yaml
├── docker-compose.yml
└── README.md

### Contributing

Contributions are welcome! Please follow the standard GitHub fork and pull request workflow.

## License

This project is licensed under the MIT License.
