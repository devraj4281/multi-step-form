import { useState } from 'react';
import { ChevronRight, Check } from 'lucide-react';

const MultiStepForm = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [formData, setFormData] = useState({
    // Step 1 - Personal Info
    name: '',
    email: '',
    phone: '',
    
    // Step 2 - Select Plan
    selectedPlan: '',
    billingCycle: 'monthly',
    
    // Step 3 - Add-ons
    onlineService: false,
    largerStorage: false,
    customizableProfile: false,
    
    // Step 4 - Summary (calculated)
  });

  const [errors, setErrors] = useState({});

  const steps = [
    {
      number: 1,
      title: 'YOUR INFO',
      label: 'Personal info',
      description: 'Please provide your name, email address, and phone number.'
    },
    {
      number: 2,
      title: 'SELECT PLAN',
      label: 'Select plan',
      description: 'You have the option of monthly or yearly billing.'
    },
    {
      number: 3,
      title: 'ADD-ONS',
      label: 'Add-ons',
      description: 'Pick add-ons to enhance your gaming experience.'
    },
    {
      number: 4,
      title: 'SUMMARY',
      label: 'Summary',
      description: 'Double-check everything looks OK before confirming.'
    }
  ];

  const plans = [
    {
      id: 'arcade',
      name: 'Arcade',
      monthlyPrice: 750, 
      yearlyPrice: 7500, 
      icon: '🕹️'
    },
    {
      id: 'advanced',
      name: 'Advanced',
      monthlyPrice: 1000, 
      yearlyPrice: 10000, 
      icon: '🎮'
    },
    {
      id: 'pro',
      name: 'Pro',
      monthlyPrice: 1250, 
      yearlyPrice: 12500, 
      icon: '👑'
    }
  ];

  const addOns = [
    {
      id: 'onlineService',
      name: 'Online service',
      description: 'Access to multiplayer games',
      monthlyPrice: 83, 
      yearlyPrice: 830 
    },
    {
      id: 'largerStorage',
      name: 'Larger storage',
      description: 'Extra 1TB of cloud save',
      monthlyPrice: 166, 
      yearlyPrice: 1660 
    },
    {
      id: 'customizableProfile',
      name: 'Customizable profile',
      description: 'Custom theme on your profile',
      monthlyPrice: 166, 
      yearlyPrice: 1660
    }
  ];

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const validateStep = (step) => {
    const newErrors = {};
    
    switch (step) {
      case 1:
        if (!formData.name.trim()) newErrors.name = 'This field is required';
        if (!formData.email.trim()) {
          newErrors.email = 'This field is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
          newErrors.email = 'Please enter a valid email address';
        }
        if (!formData.phone.trim()) newErrors.phone = 'This field is required';
        break;
        
      case 2:
        if (!formData.selectedPlan) newErrors.selectedPlan = 'Please select a plan';
        break;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 4));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const calculateTotal = () => {
    const selectedPlan = plans.find(plan => plan.id === formData.selectedPlan);
    const selectedAddOns = addOns.filter(addOn => formData[addOn.id]);
    
    const planPrice = selectedPlan 
      ? (formData.billingCycle === 'monthly' ? selectedPlan.monthlyPrice : selectedPlan.yearlyPrice)
      : 0;
    
    const addOnsPrice = selectedAddOns.reduce((total, addOn) => {
      return total + (formData.billingCycle === 'monthly' ? addOn.monthlyPrice : addOn.yearlyPrice);
    }, 0);
    
    return planPrice + addOnsPrice;
  };

const handleSubmit = async () => {
  
  if (!window.Razorpay) {
    alert("Razorpay SDK failed to load. Please check your internet connection.");
    return;
  }
console.log("Vite Key Check:", import.meta.env.VITE_RAZORPAY_KEY_ID);
  const total = calculateTotal();
  setIsProcessing(true); 

  try {
    
    const response = await fetch("http://localhost:5000/create-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount: total }),
    });
    
    if (!response.ok) throw new Error("Backend server error");
    
    const order = await response.json();

    
    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID,
      amount: order.amount,
      currency: "INR",
      description: `${formData.selectedPlan.toUpperCase()} Plan Subscription`,
      order_id: order.id, 
      handler: function (paymentResponse) {
        
        console.log("Payment Successful ID:", paymentResponse.razorpay_payment_id);
        
        setIsProcessing(false);
        setShowConfirmation(true); 
      },
      prefill: {
        name: formData.name,
        email: formData.email,
        contact: formData.phone,
      },
      theme: { color: "#483eff" }, 
      modal: {
        ondismiss: function() {
          setIsProcessing(false); 
        }
      }
    };

    const rzp = new window.Razorpay(options);
    rzp.open();

  } catch (err) {
    console.error("Payment initialization failed:", err);
    alert("Could not connect to payment server. Is your Node.js app running?");
    setIsProcessing(false);
  }
};
  const closeConfirmation = () => {
    setShowConfirmation(false);
    
    setCurrentStep(1);
    setFormData({
      name: '',
      email: '',
      phone: '',
      selectedPlan: '',
      billingCycle: 'monthly',
      onlineService: false,
      largerStorage: false,
      customizableProfile: false,
    });
  };

  const renderSidebar = () => (
    <div className="w-80 bg-gradient-to-b from-purple-600 via-blue-600 to-blue-700 relative overflow-hidden">
      
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-orange-400 rounded-full opacity-80 -translate-x-8 translate-y-8"></div>
      <div className="absolute bottom-16 right-0 w-24 h-24 bg-pink-400 rounded-full opacity-80 translate-x-6"></div>
      <div className="absolute top-1/2 left-4 w-16 h-16 bg-white opacity-20 rounded-full"></div>
      
      <div className="relative z-10 p-8 pt-12">
        {steps.map((step) => (
          <div key={step.number} className="flex items-center mb-8">
            <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center text-sm font-bold mr-4 transition-all ${
              currentStep === step.number 
                ? 'bg-blue-200 text-blue-900 border-blue-200' 
                : currentStep > step.number
                ? 'bg-green-400 text-white border-green-400'
                : 'border-white text-white'
            }`}>
              {step.number}
            </div>
            <div>
              <div className="text-blue-200 text-xs font-medium tracking-wider">
                STEP {step.number}
              </div>
              <div className="text-white font-medium text-sm mt-1">
                {step.title}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderStep1 = () => (
    <div className="max-w-md">
      <h1 className="text-3xl font-bold text-blue-900 mb-2">Personal info</h1>
      <p className="text-gray-500 mb-8">Please provide your name, email address, and phone number.</p>
      
      <div className="space-y-6">
        <div>
          <label className="block text-blue-900 font-medium mb-2">Name</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
              errors.name ? 'border-red-500' : 'border-gray-300'
            }`}
            
          />
          {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
        </div>
        
        <div>
          <label className="block text-blue-900 font-medium mb-2">Email Address</label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
              errors.email ? 'border-red-500' : 'border-gray-300'
            }`}
          
          />
          {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
        </div>
        
        <div>
          <label className="block text-blue-900 font-medium mb-2">Phone Number</label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => handleInputChange('phone', e.target.value)}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
              errors.phone ? 'border-red-500' : 'border-gray-300'
            }`}
          
          />
          {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="max-w-lg">
      <h1 className="text-3xl font-bold text-blue-900 mb-2">Select your plan</h1>
      <p className="text-gray-500 mb-8">You have the option of monthly or yearly billing.</p>
      
      <div className="space-y-4 mb-8">
        {plans.map((plan) => (
          <div
            key={plan.id}
            onClick={() => handleInputChange('selectedPlan', plan.id)}
            className={`p-4 border-2 rounded-lg cursor-pointer transition-all hover:border-purple-500 ${
              formData.selectedPlan === plan.id 
                ? 'border-purple-500 bg-purple-50' 
                : 'border-gray-200'
            }`}
          >
            <div className="flex items-center">
              <div className="text-2xl mr-4">{plan.icon}</div>
              <div className="flex-1">
                <div className="font-bold text-blue-900">{plan.name}</div>
                <div className="text-gray-500">
                  {formatPrice(formData.billingCycle === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice)}
                  /{formData.billingCycle === 'monthly' ? 'mo' : 'yr'}
                </div>
                {formData.billingCycle === 'yearly' && (
                  <div className="text-blue-900 text-sm">2 months free</div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-gray-50 p-4 rounded-lg flex items-center justify-center space-x-6">
        <span className={`font-medium ${formData.billingCycle === 'monthly' ? 'text-blue-900' : 'text-gray-500'}`}>
          Monthly
        </span>
        <button
          onClick={() => handleInputChange('billingCycle', formData.billingCycle === 'monthly' ? 'yearly' : 'monthly')}
          className="relative w-12 h-6 bg-blue-900 rounded-full transition-colors"
        >
          <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
            formData.billingCycle === 'yearly' ? 'translate-x-7' : 'translate-x-1'
          }`}></div>
        </button>
        <span className={`font-medium ${formData.billingCycle === 'yearly' ? 'text-blue-900' : 'text-gray-500'}`}>
          Yearly
        </span>
      </div>
      
      {errors.selectedPlan && <p className="mt-4 text-sm text-red-600">{errors.selectedPlan}</p>}
    </div>
  );

  const renderStep3 = () => (
    <div className="max-w-lg">
      <h1 className="text-3xl font-bold text-blue-900 mb-2">Pick add-ons</h1>
      <p className="text-gray-500 mb-8">Add-ons help enhance your gaming experience.</p>
      
      <div className="space-y-4">
        {addOns.map((addOn) => (
          <div
            key={addOn.id}
            className={`p-4 border-2 rounded-lg cursor-pointer transition-all hover:border-purple-500 ${
              formData[addOn.id] 
                ? 'border-purple-500 bg-purple-50' 
                : 'border-gray-200'
            }`}
            onClick={() => handleInputChange(addOn.id, !formData[addOn.id])}
          >
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={formData[addOn.id]}
                onChange={() => {}}
                className="w-5 h-5 text-purple-600 mr-4"
              />
              <div className="flex-1">
                <div className="font-bold text-blue-900">{addOn.name}</div>
                <div className="text-gray-500 text-sm">{addOn.description}</div>
              </div>
              <div className="text-purple-600 font-medium">
                +{formatPrice(formData.billingCycle === 'monthly' ? addOn.monthlyPrice : addOn.yearlyPrice)}
                /{formData.billingCycle === 'monthly' ? 'mo' : 'yr'}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderStep4 = () => {
    const selectedPlan = plans.find(plan => plan.id === formData.selectedPlan);
    const selectedAddOns = addOns.filter(addOn => formData[addOn.id]);
    
    const planPrice = selectedPlan 
      ? (formData.billingCycle === 'monthly' ? selectedPlan.monthlyPrice : selectedPlan.yearlyPrice)
      : 0;
    
    const addOnsPrice = selectedAddOns.reduce((total, addOn) => {
      return total + (formData.billingCycle === 'monthly' ? addOn.monthlyPrice : addOn.yearlyPrice);
    }, 0);
    
    const totalPrice = planPrice + addOnsPrice;

    return (
      <div className="max-w-lg">
        <h1 className="text-3xl font-bold text-blue-900 mb-2">Finishing up</h1>
        <p className="text-gray-500 mb-8">Double-check everything looks OK before confirming.</p>
        
        <div className="bg-gray-50 p-6 rounded-lg">
          {selectedPlan && (
            <div className="flex items-center justify-between pb-4 border-b border-gray-200">
              <div>
                <div className="font-bold text-blue-900">
                  {selectedPlan.name} ({formData.billingCycle === 'monthly' ? 'Monthly' : 'Yearly'})
                </div>
                <button 
                  onClick={() => setCurrentStep(2)}
                  className="text-gray-500 underline text-sm hover:text-purple-600"
                >
                  Change
                </button>
              </div>
              <div className="font-bold text-blue-900">
                {formatPrice(planPrice)}/{formData.billingCycle === 'monthly' ? 'mo' : 'yr'}
              </div>
            </div>
          )}
          
          {selectedAddOns.length > 0 && (
            <div className="pt-4 space-y-3">
              {selectedAddOns.map((addOn) => (
                <div key={addOn.id} className="flex items-center justify-between">
                  <div className="text-gray-500">{addOn.name}</div>
                  <div className="text-blue-900">
                    +{formatPrice(formData.billingCycle === 'monthly' ? addOn.monthlyPrice : addOn.yearlyPrice)}
                    /{formData.billingCycle === 'monthly' ? 'mo' : 'yr'}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="flex items-center justify-between p-6">
          <div className="text-gray-500">
            Total (per {formData.billingCycle === 'monthly' ? 'month' : 'year'})
          </div>
          <div className="text-2xl font-bold text-purple-600">
            +{formatPrice(totalPrice)}/{formData.billingCycle === 'monthly' ? 'mo' : 'yr'}
          </div>
        </div>
      </div>
    );
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return renderStep1();
      case 2:
        return renderStep2();
      case 3:
        return renderStep3();
      case 4:
        return renderStep4();
      default:
        return renderStep1();
    }
  };

  
  const renderConfirmationPopup = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-md mx-4 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Check className="w-8 h-8 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Thank You!</h2>
        <p className="text-gray-600 mb-6">Your subscription has been confirmed successfully.</p>
        <button
          onClick={closeConfirmation}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          OK
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {renderSidebar()}
      
      <div className="flex-1 flex flex-col">
        <div className="flex-1 p-12 flex items-center">
          <div className="w-full">
            {renderCurrentStep()}
          </div>
        </div>
        
        <div className="p-12 pt-0">
          <div className="flex justify-between items-center">
            {currentStep > 1 ? (
              <button
                onClick={prevStep}
                className="text-gray-500 hover:text-blue-900 font-medium transition-colors"
              >
                Go Back
              </button>
            ) : (
              <div></div>
            )}

            {currentStep < 4 ? (
              <button
                onClick={nextStep}
                className="bg-blue-900 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-800 transition-colors flex items-center"
              >
                Next Step
                <ChevronRight size={20} className="ml-2" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                className="bg-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-purple-700 transition-colors"
              >
                Confirm
              </button>
            )}
          </div>
        </div>
      </div>

      {showConfirmation && renderConfirmationPopup()}
    </div>
  );
};

export default MultiStepForm;