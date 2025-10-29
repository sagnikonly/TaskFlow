package com.taskflow.app;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        
        // Enable edge-to-edge display with proper insets handling
        // This ensures content doesn't overlap with system bars
        getWindow().setDecorFitsSystemWindows(false);
    }
}
