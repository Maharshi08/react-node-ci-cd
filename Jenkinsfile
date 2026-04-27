pipeline {
    agent any

    stages {

        stage('Checkout') {
            steps {
                git branch: 'main', url: 'YOUR_GIT_REPO_URL'
            }
        }

        stage('Build Backend Image') {
            steps {
                dir('backend') {
                    sh 'docker build -t backend-app .'
                }
            }
        }

        stage('Build Frontend Image') {
            steps {
                dir('frontend') {
                    sh 'docker build -t frontend-app .'
                }
            }
        }

        stage('Stop Old Containers') {
            steps {
                sh '''
                    docker stop backend || true
                    docker rm backend || true
                    docker stop frontend || true
                    docker rm frontend || true
                '''
            }
        }

        stage('Run Containers') {
            steps {
                sh '''
                    docker run -d --name backend -p 5000:5000 backend-app
                    docker run -d --name frontend -p 80:80 frontend-app
                '''
            }
        }
    }

    post {
        success {
            echo "Deployment Successful "
        }
        failure {
            echo "Build Failed "
        }
    }
}