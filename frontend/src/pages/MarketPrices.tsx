import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useMutation, useQuery } from '@tanstack/react-query';
import { getMarketPrices, getLiveMarketData } from '@/services/marketService';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { allStates, allCommodities, popularCommodities } from '@/services/mockMarketData';
import { TrendingUp, AlertTriangle, RefreshCw, Calendar } from 'lucide-react';
import { format, subDays } from 'date-fns';

const MarketPrices = () => {
  const [selectedState, setSelectedState] = useState('');
  const [selectedCommodity, setSelectedCommodity] = useState('');
  const [lastUpdated, setLastUpdated] = useState('');

  // Fetch initial popular commodities data
  const popularQuery = useQuery({
    queryKey: ['popular-market-data'],
    queryFn: () => getLiveMarketData('', 'popular'),
    refetchInterval: 300000, // Auto-refresh every 5 minutes
  });

  const mutation = useMutation({
    mutationFn: (filters: { state: string, commodity: string }) => 
      getMarketPrices(filters.state, filters.commodity),
    onSuccess: () => {
      setLastUpdated(format(new Date(), 'PPpp'));
    },
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedState && selectedCommodity) {
      mutation.mutate({ state: selectedState, commodity: selectedCommodity });
    }
  };

  const handleRefresh = () => {
    if (selectedState && selectedCommodity) {
      mutation.mutate({ state: selectedState, commodity: selectedCommodity });
    } else if (popularQuery.data) {
      popularQuery.refetch();
    }
  };

  // Set default popular commodity on component mount
  useEffect(() => {
    if (popularCommodities.length > 0 && !selectedCommodity) {
      setSelectedCommodity(popularCommodities);
    }
  }, []);

  const displayData = mutation.data || popularQuery.data;
  const isLoading = mutation.isPending || popularQuery.isLoading;
  const isError = mutation.isError || popularQuery.isError;

  return (
    <Layout>
      <div className="container mx-auto p-4 sm:p-6 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Live Market Prices</h1>
            <p className="text-muted-foreground">
              Real-time commodity prices from Mandis across India. Data sourced from Government APIs.
            </p>
            {lastUpdated && (
              <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                Last updated: {lastUpdated}
              </div>
            )}
          </div>
          <Button 
            onClick={handleRefresh} 
            variant="outline" 
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Filter Market Data
            </CardTitle>
            <CardDescription>Select a state and commodity to see real-time prices.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSearch} className="grid sm:grid-cols-3 gap-4">
              <Select onValueChange={setSelectedState} value={selectedState}>
                <SelectTrigger>
                  <SelectValue placeholder="Select State" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All States</SelectItem>
                  {allStates.map(s => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select onValueChange={setSelectedCommodity} value={selectedCommodity}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Commodity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="popular">Popular Commodities</SelectItem>
                  {allCommodities.map(c => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button 
                type="submit" 
                disabled={!selectedCommodity || isLoading}
                className="flex items-center gap-2"
              >
                {isLoading ? (
                  <>
                    <LoadingSpinner size="sm" />
                    Searching...
                  </>
                ) : (
                  'Get Prices'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {isLoading && (
          <div className="flex justify-center items-center h-48">
            <LoadingSpinner size="lg" />
          </div>
        )}

        {isError && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              {mutation.error?.message || popularQuery.error?.message || 'Failed to fetch market data'}
            </AlertDescription>
          </Alert>
        )}

        {displayData && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>
                {mutation.data ? (
                  <>Showing {displayData.count} results for {selectedCommodity} in {selectedState}</>
                ) : (
                  <>Popular Commodity Prices Across India</>
                )}
              </CardTitle>
              <CardDescription>
                Live data from government sources. Prices are in ₹ per quintal.
                {displayData.lastUpdated && (
                  <span className="ml-2">Updated: {format(new Date(displayData.lastUpdated), 'PPpp')}</span>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Market (Mandi)</TableHead>
                    <TableHead>State</TableHead>
                    <TableHead>Commodity</TableHead>
                    <TableHead>Variety</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Min Price (₹/q)</TableHead>
                    <TableHead className="text-right">Max Price (₹/q)</TableHead>
                    <TableHead className="text-right text-primary font-bold">Modal Price (₹/q)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {displayData.records && displayData.records.length > 0 ? (
                    displayData.records.map((record, index) => (
                      <TableRow key={index} className="hover:bg-muted/50">
                        <TableCell className="font-medium">{record.market}</TableCell>
                        <TableCell>{record.state}</TableCell>
                        <TableCell>{record.commodity}</TableCell>
                        <TableCell>{record.variety || 'Standard'}</TableCell>
                        <TableCell>
                          {record.source === 'live' ? (
                            <Badge variant="default" className="bg-green-100 text-green-800">
                              Live
                            </Badge>
                          ) : record.source === 'today' ? (
                            <Badge variant="default" className="bg-blue-100 text-blue-800">
                              Today
                            </Badge>
                          ) : (
                            <Badge variant="outline">Reference</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          {record.min_price?.toLocaleString('en-IN')}
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          {record.max_price?.toLocaleString('en-IN')}
                        </TableCell>
                        <TableCell className="text-right text-primary font-bold font-mono">
                          {record.modal_price?.toLocaleString('en-IN')}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                        No market data available for the selected filters.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
};

export default MarketPrices;