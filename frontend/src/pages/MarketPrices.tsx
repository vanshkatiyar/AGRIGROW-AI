import React, { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useMutation } from '@tanstack/react-query';
import { getMarketPrices } from '@/services/marketService';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge'; // Import Badge
import { allStates, allCommodities } from '@/services/mockMarketData'; // Import our new filters
import { TrendingUp, AlertTriangle } from 'lucide-react';

const MarketPrices = () => {
  const [selectedState, setSelectedState] = useState('');
  const [selectedCommodity, setSelectedCommodity] = useState('');

  const mutation = useMutation({
    mutationFn: (filters: { state: string, commodity: string }) => 
      getMarketPrices(filters.state, filters.commodity),
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedState && selectedCommodity) {
      mutation.mutate({ state: selectedState, commodity: selectedCommodity });
    }
  };

  return (
    <Layout>
      <div className="container mx-auto p-4 sm:p-6 space-y-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground mb-2">Market Prices</h1>
          <p className="text-muted-foreground">
            Get the latest commodity prices from Mandis across India.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Filter Market Data</CardTitle>
            <CardDescription>Select a state and commodity to see the latest prices.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSearch} className="grid sm:grid-cols-3 gap-4">
              <Select onValueChange={setSelectedState} value={selectedState}>
                <SelectTrigger><SelectValue placeholder="Select State" /></SelectTrigger>
                <SelectContent>{allStates.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
              </Select>
              <Select onValueChange={setSelectedCommodity} value={selectedCommodity}>
                <SelectTrigger><SelectValue placeholder="Select Commodity" /></SelectTrigger>
                <SelectContent>{allCommodities.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
              <Button type="submit" disabled={!selectedState || !selectedCommodity || mutation.isPending}>
                {mutation.isPending ? 'Searching...' : 'Get Prices'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {mutation.isPending && (
          <div className="flex justify-center items-center h-48"><LoadingSpinner size="lg" /></div>
        )}

        {mutation.isError && (
          <Alert variant="destructive"><AlertTriangle className="h-4 w-4" /><AlertTitle>Error</AlertTitle><AlertDescription>{mutation.error.message}</AlertDescription></Alert>
        )}

        {mutation.isSuccess && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>
                Showing {mutation.data.count} results for {selectedCommodity} in {selectedState}
              </CardTitle>
              <CardDescription>Live data is prioritized. Reference data is shown for markets where live data is unavailable.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Market (Mandi)</TableHead>
                    <TableHead>Variety</TableHead>
                    <TableHead>Status</TableHead> {/* New Column */}
                    <TableHead className="text-right">Min Price (₹)</TableHead>
                    <TableHead className="text-right">Max Price (₹)</TableHead>
                    <TableHead className="text-right text-primary font-bold">Modal Price (₹)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mutation.data.records.length > 0 ? (
                    mutation.data.records.map((record, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{record.market}</TableCell>
                        <TableCell>{record.variety}</TableCell>
                        <TableCell>
                          {/* New Badge to show data source */}
                          {record.source === 'live' ? (
                            <Badge variant="default">Live</Badge>
                          ) : (
                            <Badge variant="outline">Reference</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">{record.min_price}</TableCell>
                        <TableCell className="text-right">{record.max_price}</TableCell>
                        <TableCell className="text-right text-primary font-bold">{record.modal_price}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center">No live or reference data available for the selected filters.</TableCell>
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