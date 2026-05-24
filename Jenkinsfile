pipeline {
    agent any

    environment {
        DOCKER_REGISTRY = 'docker.io'
        IMAGE_PREFIX = 'codesphere'
        VERSION = "${env.BUILD_NUMBER}"
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
                            sh 'npm ci'
                            sh 'npm test'
                        }
                    }
                }
                stage('Frontend Tests') {
                    steps {
                        dir('frontend') {
                            sh 'npm ci'
                            sh 'npm test -- --watchAll=false'
                        }
                    }
                }
            }
        }

        stage('🔒 Security Scan') {
            steps {
                echo '🛡️ Running Trivy security scan...'
                sh '''
                    trivy fs --format table --severity HIGH,CRITICAL ./backend
                    trivy fs --format table --severity HIGH,CRITICAL ./frontend
                    trivy fs --format table --severity HIGH,CRITICAL ./executor-service
                '''
            }
        }

        stage('🐳 Build Docker Images') {
            steps {
                echo '🏗️ Building Docker images...'
                sh """
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
                sh """
                    trivy image --severity HIGH,CRITICAL ${IMAGE_PREFIX}-frontend:${VERSION}
                    trivy image --severity HIGH,CRITICAL ${IMAGE_PREFIX}-backend:${VERSION}
                    trivy image --severity HIGH,CRITICAL ${IMAGE_PREFIX}-executor:${VERSION}
                """
            }
        }

        stage('🏷️ Tag Images') {
            steps {
                echo '🏷️ Tagging images as latest...'
                sh """
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
                sh '''
                    docker-compose down --remove-orphans
                    docker-compose up -d --build
                    docker-compose ps
                '''
            }
        }

        stage('✅ Health Check') {
            steps {
                echo '🏥 Verifying deployment...'
                sh '''
                    sleep 10
                    curl -f http://localhost/api/health || exit 1
                    echo "✅ Deployment successful!"
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
            sh 'docker-compose logs --tail=50'
        }
        always {
            echo '🧹 Cleaning up...'
            sh 'docker system prune -f --volumes --filter "label!=keep"'
        }
    }
}
