import { useState } from "react";
import { TopBar } from "@/components/layout/top-bar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function ApiDocs() {
  const [selectedEndpoint, setSelectedEndpoint] = useState("customers");

  const baseUrl = process.env.NODE_ENV === 'production' 
    ? 'https://your-domain.com/api' 
    : 'http://localhost:5000/api';

  const endpoints = {
    customers: {
      title: "Customer Data Ingestion",
      description: "Securely ingest customer data with validation and async processing",
      method: "POST",
      path: "/customers",
      auth: false,
      requestBody: {
        name: "string",
        email: "string", 
        phone: "string",
        totalSpend: "number",
        visitCount: "number",
        lastVisit: "date",
        registrationDate: "date"
      },
      response: {
        success: true,
        customer: {
          id: 123,
          name: "John Doe",
          email: "john@example.com",
          totalSpend: "15000.00",
          createdAt: "2024-01-15T10:30:00Z"
        }
      }
    },
    orders: {
      title: "Order Data Ingestion",
      description: "Process order data with pub-sub architecture for scalability",
      method: "POST",
      path: "/orders",
      auth: false,
      requestBody: {
        customerId: "number",
        orderId: "string",
        amount: "number",
        orderDate: "date",
        items: ["item1", "item2"]
      },
      response: {
        success: true,
        order: {
          id: 456,
          customerId: 123,
          amount: "2500.00",
          orderDate: "2024-01-15T14:30:00Z"
        }
      }
    },
    segments: {
      title: "Audience Segments",
      description: "Create and manage customer segments with real-time size calculation",
      method: "POST",
      path: "/segments",
      auth: true,
      requestBody: {
        name: "string",
        description: "string",
        rules: [
          {
            field: "totalSpend",
            operator: "gt",
            value: 10000,
            logic: "AND"
          }
        ]
      },
      response: {
        success: true,
        segment: {
          id: 789,
          name: "High Value Customers",
          audienceSize: 1247,
          createdAt: "2024-01-15T10:30:00Z"
        }
      }
    },
    campaigns: {
      title: "Campaign Management",
      description: "Create and launch marketing campaigns with delivery tracking",
      method: "POST",
      path: "/campaigns",
      auth: true,
      requestBody: {
        name: "string",
        segmentId: "number",
        message: "string",
        channel: "email|sms|push",
        status: "draft|active"
      },
      response: {
        success: true,
        campaign: {
          id: 101,
          name: "Holiday Sale Campaign",
          audienceSize: 1247,
          status: "active",
          createdAt: "2024-01-15T10:30:00Z"
        }
      }
    },
    webhook: {
      title: "Delivery Receipt Webhook",
      description: "Endpoint for delivery status updates from vendor APIs",
      method: "POST", 
      path: "/delivery-receipt",
      auth: false,
      requestBody: {
        messageId: "string",
        status: "SENT|DELIVERED|FAILED",
        timestamp: "date",
        errorReason: "string (optional)"
      },
      response: {
        success: true
      }
    }
  };

  const testEndpoint = async (endpoint: string) => {
    const endpointData = endpoints[endpoint as keyof typeof endpoints];
    
    try {
      // This would make an actual API call in a real implementation
      console.log(`Testing ${endpointData.method} ${baseUrl}${endpointData.path}`);
      alert(`Test request sent to ${endpointData.method} ${baseUrl}${endpointData.path}\n\nCheck the browser console for details.`);
    } catch (error) {
      console.error('Test failed:', error);
      alert('Test failed. Check console for details.');
    }
  };

  return (
    <div className="flex-1 flex flex-col">
      <TopBar
        title="API Documentation"
        subtitle="RESTful APIs for customer data ingestion and campaign management"
        actionButton={{
          label: "Download OpenAPI Spec",
          onClick: () => {},
          variant: "secondary",
        }}
      />

      <main className="flex-1 p-8 overflow-y-auto">
        {/* API Overview */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center space-x-3">
              <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
              <div>
                <CardTitle className="text-2xl">Xeno CRM API</CardTitle>
                <p className="text-slate-600 mt-1">Comprehensive REST API for customer relationship management</p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                <h4 className="font-medium text-primary mb-2">Base URL</h4>
                <code className="text-sm bg-primary/10 px-2 py-1 rounded">{baseUrl}</code>
              </div>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="font-medium text-green-800 mb-2">Authentication</h4>
                <code className="text-sm bg-green-100 px-2 py-1 rounded text-green-700">Google OAuth 2.0</code>
              </div>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <h4 className="font-medium text-amber-800 mb-2">Rate Limit</h4>
                <code className="text-sm bg-amber-100 px-2 py-1 rounded text-amber-700">1000 req/hour</code>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* API Endpoints */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Endpoints</CardTitle>
              </CardHeader>
              <CardContent>
                <nav className="space-y-2">
                  {Object.entries(endpoints).map(([key, endpoint]) => (
                    <Button
                      key={key}
                      variant={selectedEndpoint === key ? "default" : "ghost"}
                      className="w-full justify-start"
                      onClick={() => setSelectedEndpoint(key)}
                    >
                      <Badge
                        variant="secondary"
                        className={`mr-3 ${
                          endpoint.method === 'POST' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {endpoint.method}
                      </Badge>
                      <span className="truncate">{endpoint.title}</span>
                    </Button>
                  ))}
                </nav>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {Object.entries(endpoints).map(([key, endpoint]) => (
              <div
                key={key}
                className={selectedEndpoint === key ? "block" : "hidden"}
              >
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Badge
                          className={
                            endpoint.method === 'POST'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-blue-100 text-blue-800'
                          }
                        >
                          {endpoint.method}
                        </Badge>
                        <code className="text-sm font-mono bg-slate-100 px-2 py-1 rounded">
                          {endpoint.path}
                        </code>
                        {endpoint.auth && (
                          <Badge variant="outline" className="text-amber-600 border-amber-300">
                            🔒 Auth Required
                          </Badge>
                        )}
                      </div>
                      <Button
                        onClick={() => testEndpoint(key)}
                        size="sm"
                        variant="outline"
                      >
                        Test API
                      </Button>
                    </div>
                    <div>
                      <CardTitle className="text-xl">{endpoint.title}</CardTitle>
                      <p className="text-slate-600 mt-1">{endpoint.description}</p>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Tabs defaultValue="request" className="space-y-4">
                      <TabsList>
                        <TabsTrigger value="request">Request</TabsTrigger>
                        <TabsTrigger value="response">Response</TabsTrigger>
                        <TabsTrigger value="examples">Examples</TabsTrigger>
                      </TabsList>
                      
                      <TabsContent value="request" className="space-y-4">
                        <div>
                          <h5 className="text-sm font-medium text-slate-700 mb-2">Headers</h5>
                          <div className="bg-slate-900 text-slate-100 rounded-lg p-4 text-sm overflow-x-auto">
                            <pre>{`Content-Type: application/json${endpoint.auth ? '\nAuthorization: Bearer <token>' : ''}`}</pre>
                          </div>
                        </div>
                        
                        <div>
                          <h5 className="text-sm font-medium text-slate-700 mb-2">Request Body</h5>
                          <div className="bg-slate-900 text-slate-100 rounded-lg p-4 text-sm overflow-x-auto">
                            <pre>{JSON.stringify(endpoint.requestBody, null, 2)}</pre>
                          </div>
                        </div>
                      </TabsContent>
                      
                      <TabsContent value="response" className="space-y-4">
                        <div>
                          <h5 className="text-sm font-medium text-slate-700 mb-2">Success Response (200)</h5>
                          <div className="bg-slate-900 text-slate-100 rounded-lg p-4 text-sm overflow-x-auto">
                            <pre>{JSON.stringify(endpoint.response, null, 2)}</pre>
                          </div>
                        </div>
                      </TabsContent>
                      
                      <TabsContent value="examples" className="space-y-4">
                        <div>
                          <h5 className="text-sm font-medium text-slate-700 mb-2">cURL Example</h5>
                          <div className="bg-slate-900 text-slate-100 rounded-lg p-4 text-sm overflow-x-auto">
                            <pre>{`curl -X ${endpoint.method} ${baseUrl}${endpoint.path} \\
  -H "Content-Type: application/json"${endpoint.auth ? ' \\\n  -H "Authorization: Bearer <token>"' : ''} \\
  -d '${JSON.stringify(endpoint.requestBody, null, 2)}'`}</pre>
                          </div>
                        </div>
                        
                        <div>
                          <h5 className="text-sm font-medium text-slate-700 mb-2">JavaScript Example</h5>
                          <div className="bg-slate-900 text-slate-100 rounded-lg p-4 text-sm overflow-x-auto">
                            <pre>{`const response = await fetch('${baseUrl}${endpoint.path}', {
  method: '${endpoint.method}',
  headers: {
    'Content-Type': 'application/json',${endpoint.auth ? "\n    'Authorization': 'Bearer <token>'," : ''}
  },
  body: JSON.stringify(${JSON.stringify(endpoint.requestBody, null, 2)})
});

const data = await response.json();
console.log(data);`}</pre>
                          </div>
                        </div>
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>

        {/* SDK & Tools */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>SDK & Integration Tools</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Button
                variant="outline"
                className="h-20 flex-col space-y-2"
                onClick={() => window.open('/api/swagger', '_blank')}
              >
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span className="font-medium">Swagger UI</span>
              </Button>
              
              <Button
                variant="outline"
                className="h-20 flex-col space-y-2"
                onClick={() => alert('Postman collection will be downloaded')}
              >
                <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span className="font-medium">Postman Collection</span>
              </Button>
              
              <Button
                variant="outline"
                className="h-20 flex-col space-y-2"
                onClick={() => alert('Python SDK documentation will be shown')}
              >
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
                <span className="font-medium">Python SDK</span>
              </Button>
              
              <Button
                variant="outline"
                className="h-20 flex-col space-y-2"
                onClick={() => alert('Node.js SDK documentation will be shown')}
              >
                <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
                <span className="font-medium">Node.js SDK</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Error Codes */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Error Codes & Responses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border border-red-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Badge className="bg-red-100 text-red-800">400</Badge>
                    <span className="font-medium">Bad Request</span>
                  </div>
                  <p className="text-sm text-slate-600 mb-2">Invalid request format or missing required fields</p>
                  <div className="bg-slate-900 text-slate-100 rounded p-2 text-xs">
                    <pre>{`{
  "error": "Validation failed",
  "details": ["email is required"]
}`}</pre>
                  </div>
                </div>
                
                <div className="border border-amber-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Badge className="bg-amber-100 text-amber-800">401</Badge>
                    <span className="font-medium">Unauthorized</span>
                  </div>
                  <p className="text-sm text-slate-600 mb-2">Authentication required or invalid token</p>
                  <div className="bg-slate-900 text-slate-100 rounded p-2 text-xs">
                    <pre>{`{
  "error": "Authentication required"
}`}</pre>
                  </div>
                </div>
                
                <div className="border border-orange-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Badge className="bg-orange-100 text-orange-800">429</Badge>
                    <span className="font-medium">Rate Limited</span>
                  </div>
                  <p className="text-sm text-slate-600 mb-2">Too many requests, slow down</p>
                  <div className="bg-slate-900 text-slate-100 rounded p-2 text-xs">
                    <pre>{`{
  "error": "Rate limit exceeded",
  "retry_after": 3600
}`}</pre>
                  </div>
                </div>
                
                <div className="border border-red-300 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Badge className="bg-red-100 text-red-800">500</Badge>
                    <span className="font-medium">Server Error</span>
                  </div>
                  <p className="text-sm text-slate-600 mb-2">Internal server error, try again later</p>
                  <div className="bg-slate-900 text-slate-100 rounded p-2 text-xs">
                    <pre>{`{
  "error": "Internal server error",
  "request_id": "req_12345"
}`}</pre>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
