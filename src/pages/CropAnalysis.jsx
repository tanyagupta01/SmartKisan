import React, { useState, useRef, useCallback } from 'react';
import { 
  Camera, 
  Upload, 
  ArrowLeft, 
  Loader2, 
  CheckCircle, 
  AlertTriangle, 
  Info,
  User,
  Settings,
  Bell
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { resizeAndCompress, fastCompress } from '../utils/compress-image';

// Button Component (matching dashboard)
const Button = React.forwardRef(({ className = '', variant = 'default', size = 'default', children, ...props }, ref) => {
  const baseClasses = "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50";
  
  const variantClasses = {
    default: "bg-blue-600 text-white hover:bg-blue-700",
    destructive: "bg-red-600 text-white hover:bg-red-700",
    outline: "border border-gray-300 bg-white hover:bg-gray-50",
    secondary: "bg-gray-100 text-gray-900 hover:bg-gray-200",
    ghost: "hover:bg-gray-100",
    link: "text-blue-600 underline-offset-4 hover:underline",
  };
  
  const sizeClasses = {
    default: "h-10 px-4 py-2",
    sm: "h-9 rounded-md px-3",
    lg: "h-11 rounded-md px-8",
    icon: "h-10 w-10",
  };
  
  const classes = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`;
  
  return (
    <button
      className={classes}
      ref={ref}
      {...props}
    >
      {children}
    </button>
  );
});

// Card Components (matching dashboard)
const Card = React.forwardRef(({ className = '', children, ...props }, ref) => {
  const classes = `rounded-lg border bg-white text-gray-900 shadow-sm ${className}`;
  
  return (
    <div
      ref={ref}
      className={classes}
      {...props}
    >
      {children}
    </div>
  );
});

const CardHeader = React.forwardRef(({ className = '', children, ...props }, ref) => {
  const classes = `flex flex-col space-y-1.5 p-6 ${className}`;
  
  return (
    <div
      ref={ref}
      className={classes}
      {...props}
    >
      {children}
    </div>
  );
});

const CardTitle = React.forwardRef(({ className = '', children, ...props }, ref) => {
  const classes = `text-lg font-semibold leading-none tracking-tight ${className}`;
  
  return (
    <h3
      ref={ref}
      className={classes}
      {...props}
    >
      {children}
    </h3>
  );
});

const CardContent = React.forwardRef(({ className = '', children, ...props }, ref) => {
  const classes = `p-6 pt-0 ${className}`;
  
  return (
    <div ref={ref} className={classes} {...props}>
      {children}
    </div>
  );
});

// Pre-configured axios instance
const apiClient = axios.create({
  baseURL: 'http://localhost:5050',
  timeout: 30000, // 30 second timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

const CropAnalysis = () => {
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);
  const galleryInputRef = useRef(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [processingTime, setProcessingTime] = useState(null);
  const [progress, setProgress] = useState(0);

  const handleImageUpload = useCallback(async (event) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const rawDataUrl = e.target.result;
        // Use fast compression for quicker processing
        const compressed = await fastCompress(rawDataUrl, 384, 0.7);
        setSelectedImage(compressed);
        setAnalysisResult(null);
        setProcessingTime(null);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const handleCameraCapture = useCallback(() => {
    cameraInputRef.current?.click();
  }, []);

  const handleGalleryUpload = useCallback(() => {
    galleryInputRef.current?.click();
  }, []);

  const analyzeImage = useCallback(async () => {
    if (!selectedImage) return;

    setIsAnalyzing(true);
    setProgress(0);
    
    // Simulate progress for better UX
    const progressInterval = setInterval(() => {
      setProgress(prev => Math.min(prev + 10, 90));
    }, 500);

    try {
      const startTime = Date.now();
      
      const { data } = await apiClient.post('/api/analyze-image', {
        imageBase64: selectedImage
      });

      const endTime = Date.now();
      const totalTime = endTime - startTime;
      
      setProgress(100);
      setAnalysisResult(data.result);
      setProcessingTime(totalTime);
      
      clearInterval(progressInterval);
      
    } catch (err) {
      clearInterval(progressInterval);
      const status = err.response?.status || 500;
      const payload = err.response?.data || { error: err.message };
      
      console.error(`❌ /api/analyze-image → HTTP ${status}`, JSON.stringify(payload, null, 2));
      
      // Show error to user
      setAnalysisResult({
        crop: 'Unknown',
        disease: 'Analysis Failed',
        description: 'Failed to analyze the image. Please try again with a clearer photo.',
        treatment: ['Retake photo with better lighting', 'Ensure crop is clearly visible', 'Try again'],
        mandi: []
      });
    } finally {
      setIsAnalyzing(false);
      clearInterval(progressInterval);
    }
  }, [selectedImage]);

  const navigate = useNavigate();
  const handleNavigation = useCallback((path) => {
    navigate(path);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header - matching dashboard style */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <Button variant="ghost" size="icon" onClick={() => handleNavigation('/dashboard')}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">🌾</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Crop Analysis</h1>
                <p className="text-sm text-gray-600">AI-Powered Disease Detection</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">3</span>
              </Button>
              <Button variant="ghost" size="icon">
                <User className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Image Upload Section */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Upload or Capture Crop Image</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Image Preview */}
                {selectedImage ? (
                  <div className="relative">
                    <img 
                      src={selectedImage} 
                      alt="Selected crop" 
                      className="w-full max-w-md mx-auto rounded-lg shadow-lg"
                    />
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="absolute top-2 right-2"
                      onClick={() => {
                        setSelectedImage(null);
                        setAnalysisResult(null);
                        setProcessingTime(null);
                      }}
                    >
                      Remove
                    </Button>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:border-green-400 transition-colors">
                    <Camera className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                    <p className="text-lg text-gray-600 mb-2">No image selected</p>
                    <p className="text-sm text-gray-500">Take a clear photo of your crop showing any affected areas</p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button 
                    onClick={handleCameraCapture}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                    disabled={isAnalyzing}
                  >
                    <Camera className="mr-2 h-5 w-5" />
                    Capture Photo
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={handleGalleryUpload}
                    disabled={isAnalyzing}
                  >
                    <Upload className="mr-2 h-5 w-5" />
                    Upload from Gallery
                  </Button>
                </div>

                <input
                  ref={cameraInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                
                <input
                  ref={galleryInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />

                {/* Analyze Button */}
                {selectedImage && !analysisResult && (
                  <div className="text-center">
                    <Button 
                      onClick={analyzeImage}
                      disabled={isAnalyzing}
                      size="lg"
                      className="bg-green-600 hover:bg-green-700 text-white px-8"
                    >
                      {isAnalyzing ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Analyzing... {progress}%
                        </>
                      ) : (
                        'Analyze Crop Health'
                      )}
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Analysis Progress */}
          {isAnalyzing && (
            <Card className="mb-8">
              <CardContent className="p-8">
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4">
                    <div className="w-full h-full border-4 border-green-200 border-t-green-600 rounded-full animate-spin"></div>
                  </div>
                  <h3 className="text-xl font-semibold mb-2">AI Analysis in Progress</h3>
                  <p className="text-gray-600 mb-4">Processing your crop image using advanced computer vision...</p>
                  <div className="bg-gray-200 rounded-full h-3 mb-4">
                    <div 
                      className="bg-green-600 h-3 rounded-full transition-all duration-300" 
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-gray-500">
                    {progress < 30 && "🔍 Analyzing image quality..."}
                    {progress >= 30 && progress < 60 && "🌱 Identifying crop species..."}
                    {progress >= 60 && progress < 90 && "🔬 Detecting diseases and pests..."}
                    {progress >= 90 && "✅ Finalizing results..."}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Analysis Results */}
          {analysisResult && (
            <div className="space-y-6">
              {/* Main Result Card */}
              <Card className="border-l-4 border-l-green-500">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Analysis Results</span>
                    {processingTime && (
                      <span className="text-sm text-green-600 font-normal">
                        Completed in {(processingTime / 1000).toFixed(1)}s
                      </span>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-semibold text-gray-700 mb-1">Crop Type</h4>
                        <p className="text-lg font-bold text-gray-900">{analysisResult.crop}</p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-700 mb-1">Detected Issue</h4>
                        <p className="text-lg font-bold text-gray-900">{analysisResult.disease}</p>
                      </div>
                    </div>
                    
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-gray-700">{analysisResult.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Treatment Recommendations */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg text-blue-700">Treatment Recommendations</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {analysisResult.treatment.map((item, index) => (
                      <li key={index} className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-gray-700">{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSelectedImage(null);
                    setAnalysisResult(null);
                    setProcessingTime(null);
                  }}
                >
                  Analyze Another Image
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CropAnalysis;