<?php
// Port de src/lib/classes.ts — clases activas por escuela.

const BBG_CLASSES = [
    ['code' => 'gelb', 'label' => 'Gelb'],
];

const ESG_CLASSES = [
    ['code' => 'k4', 'label' => 'Klasse 4'],
];

function all_classes(): array {
    return array_merge(BBG_CLASSES, ESG_CLASSES);
}

function all_class_codes(): array {
    return array_map(fn($c) => $c['code'], all_classes());
}

function class_label(string $code): string {
    foreach (all_classes() as $c) {
        if ($c['code'] === $code) return $c['label'];
    }
    return strtoupper($code);
}

function get_school(string $classCode): ?string {
    foreach (BBG_CLASSES as $c) if ($c['code'] === $classCode) return 'bbg';
    foreach (ESG_CLASSES as $c) if ($c['code'] === $classCode) return 'esg';
    return null; // admin
}

function get_classes_for_school(string $school): array {
    return $school === 'bbg' ? BBG_CLASSES : ESG_CLASSES;
}

function get_class_codes_for_school(string $school): array {
    return array_map(fn($c) => $c['code'], get_classes_for_school($school));
}
