
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchUserEngagement, UserEngagementResponse } from '@/services/userEngagementService';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Trophy } from 'lucide-react';

const HallOfShame = () => {
  const { data: usersEngagement, isLoading, error } = useQuery({
    queryKey: ['userEngagement'],
    queryFn: fetchUserEngagement
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading engagement data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center text-red-500">
          <p>Failed to load user engagement data.</p>
        </div>
      </div>
    );
  }

  // Sort users by conversation_count (ascending for least engaged)
  const sortedUsers = Object.entries(usersEngagement || {})
    .sort(([, a], [, b]) => a.conversation_count - b.conversation_count)
    .map(([email, data], index) => ({
      email,
      rank: index + 1,
      ...data
    }));

  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="shadow-lg">
        <CardHeader className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-t-lg">
          <div className="flex items-center gap-3">
            <Trophy className="h-8 w-8" />
            <div>
              <CardTitle className="text-2xl font-bold">Hall of Shame</CardTitle>
              <CardDescription className="text-purple-100">
                Users with the lowest engagement rates
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">Rank</TableHead>
                <TableHead>User</TableHead>
                <TableHead className="text-right">Conversations</TableHead>
                <TableHead className="text-right">Avg Messages</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedUsers.map((user) => (
                <TableRow key={user.email} className="hover:bg-purple-50">
                  <TableCell className="font-medium">#{user.rank}</TableCell>
                  <TableCell className="font-medium">{user.email}</TableCell>
                  <TableCell className="text-right">{user.conversation_count}</TableCell>
                  <TableCell className="text-right">{user.mean_user_messages.toFixed(1)}</TableCell>
                </TableRow>
              ))}
              {sortedUsers.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-gray-500">
                    No user data available
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default HallOfShame;
