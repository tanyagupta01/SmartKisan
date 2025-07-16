import React, { useState, useRef } from 'react';
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

const CropAnalysis = () => {
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);
  const galleryInputRef = useRef(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);

  const handleImageUpload = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedImage(e.target?.result);
        setAnalysisResult(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCameraCapture = () => {
    cameraInputRef.current?.click();
  };

  const handleGalleryUpload = () => {
    galleryInputRef.current?.click();
  };

  const analyzeImage = async () => {
    if (!selectedImage) return;

    setIsAnalyzing(true);
    
    try {
      // send base64 (with prefix) to backend
      const { data } = await axios.post('https://smartkisan.onrender.com/api/analyze-image', {
        imageBase64: selectedImage
      });

      // data.result should match { disease, confidence, severity, description, treatment: [...] }
      setAnalysisResult(data.result);
    } catch (err) {
        const status  = err.response?.status || 500;
        const payload = err.response?.data || { error: err.message };

        console.error(`❌ /api/analyze-image → HTTP ${status}`, JSON.stringify(payload, null, 2));
        return res.status(status).json(payload);
            } finally {
              setIsAnalyzing(false);
            }
          };

  const navigate = useNavigate();
  const handleNavigation = (path) => {
    navigate(path);
    console.log(`Navigating to: ${path}`);
  };

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
              <CardTitle>Upload or Capture Crop Image</CardTitle>
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
                      onClick={() => setSelectedImage(null)}
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
                  >
                    <Camera className="mr-2 h-5 w-5" />
                    Capture Photo
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={handleGalleryUpload}
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
                          Analyzing Image...
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
                  <div className="bg-gray-200 rounded-full h-2 mb-4">
                    <div className="bg-green-600 h-2 rounded-full animate-pulse" style={{ width: '70%' }}></div>
                  </div>
                  <div className="text-sm text-gray-500 space-y-1">
                    <p>✓ Image quality validated</p>
                    <p>✓ Plant species identified</p>
                    <p className="animate-pulse">⏳ Analyzing for diseases and pests...</p>
                  </div>
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
                  <div className="flex items-center justify-between">
                    {/* <CardTitle className="flex items-center">
                      {getSeverityIcon(analysisResult.severity)}
                      <span className="ml-2">Analysis Results</span>
                    </CardTitle> */}
                  </div>
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
              <div className="flex justify-center">
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
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSelectedImage(null);
                    setAnalysisResult(null);
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