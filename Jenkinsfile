pipeline {
    agent any

    environment {
        COMPOSE = ""
    }

    stages {

        stage('Checkout') {
            steps {
                git branch: 'main', url: 'https://github.com/Maharshi08/react-node-ci-cd.git'
            }
        }

        stage('Detect Docker Compose') {
            steps {
                script {
                    // Detect docker compose version (v1 vs v2)
                    def composeV2 = sh(script: 'docker compose version 2>/dev/null && echo "v2" || echo "v1"', returnStdout: true).trim()
                    env.COMPOSE = composeV2 == 'v2' ? 'docker compose' : 'docker-compose'
                    echo "Using: ${env.COMPOSE}"
                }
            }
        }

        stage('Cleanup') {
            steps {
                sh """
                    # Stop and remove containers, networks, volumes, and orphans
                    ${env.COMPOSE} down -v --remove-orphans 2>/dev/null || true
                    
                    # Kill any containers using our ports
                    fuser -k 8081/tcp 2>/dev/null || true
                    fuser -k 5000/tcp 2>/dev/null || true
                    fuser -k 27017/tcp 2>/dev/null || true
                    
                    # Remove any leftover containers with our names
                    docker rm -f $(docker ps -a --filter "name=backend" -q) 2>/dev/null || true
                    docker rm -f $(docker ps -a --filter "name=frontend" -q) 2>/dev/null || true
                    docker rm -f $(docker ps -a --filter "name=mongo" -q) 2>/dev/null || true
                """
            }
        }

        stage('Build Images') {
            steps {
                sh """
                    ${env.COMPOSE} build --no-cache
                """
            }
        }

        stage('Deploy') {
            steps {
                sh """
                    ${env.COMPOSE} up -d
                    
                    # Wait for services to be healthy
                    echo "Waiting for services to start..."
                    sleep 10
                """
            }
        }

        stage('Verify') {
            steps {
                sh """
                    docker ps
                    
                    # Check container health
                    echo "Checking container status..."
                    docker inspect --format='{{.State.Health.Status}}' backend 2>/dev/null || echo "No health check defined"
                """
            }
        }
    }

    post {
        success {
            echo "Deployment Successful 🚀"
        }
        failure {
            echo "Deployment Failed ❌"
            sh "${env.COMPOSE} logs"
        }
    }
}