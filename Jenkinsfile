pipeline {
    agent any

    environment {
        DOCKER_REGISTRY = 'docker.io'
        IMAGE_PREFIX = 'codesphere'
        VERSION = "${env.BUILD_NUMBER}"
        CI = 'true'
    }

    stages {
        stage('🔍 Checkout') {
            steps {
                echo '📥 Checking out source code...'
                checkout scm
            }
        }

        stage('🧪 Run Tests') {
            parallel {
                stage('Backend Tests') {
                    steps {
                        dir('backend') {
                            bat 'npm ci'
                            bat 'npm test'
                        }
                    }
                }
                stage('Frontend Tests') {
                    steps {
                        dir('frontend') {
                            bat 'npm ci'
                            bat 'npm test -- --watchAll=false'
                        }
                    }
                }
            }
        }

        stage('🔒 Security Scan') {
            steps {
                echo '🛡️ Running Trivy security scan...'
                bat '''
                    trivy fs --format table --severity HIGH,CRITICAL ./backend
                    trivy fs --format table --severity HIGH,CRITICAL ./frontend
                    trivy fs --format table --severity HIGH,CRITICAL ./executor-service
                '''
            }
        }

        stage('🐳 Build Docker Images') {
            steps {
                echo '🏗️ Building Docker images...'
                bat """
                    docker build -t ${IMAGE_PREFIX}-frontend:${VERSION} ./frontend
                    docker build -t ${IMAGE_PREFIX}-backend:${VERSION} ./backend
                    docker build -t ${IMAGE_PREFIX}-executor:${VERSION} ./executor-service
                    docker build -t ${IMAGE_PREFIX}-nginx:${VERSION} ./nginx
                """
            }
        }

        stage('🔒 Image Security Scan') {
            steps {
                echo '🛡️ Scanning Docker images with Trivy...'
                bat """
                    trivy image --severity HIGH,CRITICAL ${IMAGE_PREFIX}-frontend:${VERSION}
                    trivy image --severity HIGH,CRITICAL ${IMAGE_PREFIX}-backend:${VERSION}
                    trivy image --severity HIGH,CRITICAL ${IMAGE_PREFIX}-executor:${VERSION}
                """
            }
        }

        stage('🏷️ Tag Images') {
            steps {
                echo '🏷️ Tagging images as latest...'
                bat """
                    docker tag ${IMAGE_PREFIX}-frontend:${VERSION} ${IMAGE_PREFIX}-frontend:latest
                    docker tag ${IMAGE_PREFIX}-backend:${VERSION} ${IMAGE_PREFIX}-backend:latest
                    docker tag ${IMAGE_PREFIX}-executor:${VERSION} ${IMAGE_PREFIX}-executor:latest
                    docker tag ${IMAGE_PREFIX}-nginx:${VERSION} ${IMAGE_PREFIX}-nginx:latest
                """
            }
        }

        stage('🚀 Deploy') {
            steps {
                echo '🚀 Deploying with Docker Compose...'
                bat '''
                    docker-compose down --remove-orphans
                    docker-compose up -d --build
                    docker-compose ps
                '''
            }
        }

        stage('✅ Health Check') {
            steps {
                echo '🏥 Verifying deployment...'
                bat '''
                    powershell -Command "Start-Sleep -Seconds 10"
                    curl -f http://localhost/api/health || exit 1
                    echo Deployment successful!
                '''
            }
        }
    }

    post {
        success {
            echo '🎉 Pipeline completed successfully!'
        }
        failure {
            echo '❌ Pipeline failed!'
            bat 'docker-compose logs --tail=50'
        }
        always {
            echo '🧹 Cleaning up...'
            bat 'docker system prune -f --volumes --filter "label!=keep"'
        }
    }
}
