import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, Text, Pressable } from 'react-native';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <View style={{ flex: 1, backgroundColor: 'red', justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <Text style={{ color: 'white', fontSize: 18, fontWeight: 'bold' }}>UI Crashed</Text>
          <Text style={{ color: 'white', marginTop: 10 }}>{this.state.error?.message}</Text>
          <Pressable onPress={() => this.setState({ hasError: false })} style={{ marginTop: 20, padding: 10, backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <Text style={{ color: 'white' }}>Retry</Text>
          </Pressable>
        </View>
      );
    }

    return this.props.children;
  }
}
