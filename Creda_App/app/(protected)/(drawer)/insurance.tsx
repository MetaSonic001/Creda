import React from 'react';
import { Container } from '~/components/Container';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { P, Title } from '~/components/ui/typography';

export default function Insurance() {
  return (
    <Container>
      <Title>Insurance & Claims</Title>
      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Upload policy</CardTitle>
        </CardHeader>
        <CardContent>
          <P>Attach PDF or photo to store securely.</P>
        </CardContent>
      </Card>
    </Container>
  );
}


